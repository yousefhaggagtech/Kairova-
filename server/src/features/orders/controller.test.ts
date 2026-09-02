import cookieParser from "cookie-parser";
import express from "express";
import request from "supertest";

import globalErrorHandler from "../../middleware/globalErrorHandler.js";
import Category, { type ICategory } from "../../models/Category.js";
import Order, { type IOrder, type IShippingAddress } from "../../models/Order.js";
import Product, { type IProduct } from "../../models/Product.js";
import Settings from "../../models/Settings.js";
import User, { type IUser } from "../../models/User.js";
import { signAccessToken } from "../auth/tokenService.js";
import {
  confirmDeposit,
  confirmFullPayment,
  createReservation,
  markPacked,
} from "./service.js";
import {
  adminRouter as adminOrdersRouter,
  customerRouter as customerOrdersRouter,
} from "./routes.js";

interface SeedData {
  customer: IUser;
  otherCustomer: IUser;
  admin: IUser;
  category: ICategory;
  product: IProduct;
}

const shippingAddress: IShippingAddress = {
  label: "Home",
  street: "12 Nile Street",
  city: "Cairo",
  governorate: "Cairo",
  phone: "+201001234567",
};

const idOf = (document: { _id: unknown }): string => String(document._id);

const createTestApp = () => {
  const testApp = express();

  testApp.use(express.json());
  testApp.use(cookieParser());
  testApp.use("/api/orders", customerOrdersRouter);
  testApp.use("/api/admin/orders", adminOrdersRouter);
  testApp.use(globalErrorHandler);

  return testApp;
};

const app = createTestApp();

const authCookie = (user: IUser): string => {
  return `accessToken=${signAccessToken(idOf(user), user.role)}`;
};

const seedOrderDependencies = async (): Promise<SeedData> => {
  const [customer, otherCustomer, admin] = await User.insertMany([
    {
      name: "Test Customer",
      email: "customer@example.com",
      password: "password123",
      phone: "+201001234567",
      role: "customer",
    },
    {
      name: "Other Customer",
      email: "other@example.com",
      password: "password123",
      phone: "+201002222222",
      role: "customer",
    },
    {
      name: "Test Admin",
      email: "admin@example.com",
      password: "password123",
      phone: "+201009876543",
      role: "admin",
    },
  ]);
  const category = await Category.create({
    name: { ar: "Men Watches AR", en: "Men Watches" },
    slug: "men-watches",
    gender: "men",
    parentCategory: null,
  });
  const subcategory = await Category.create({
    name: { ar: "Classic Watches AR", en: "Classic Watches" },
    slug: "classic-watches",
    gender: "men",
    parentCategory: category._id.toString(),
  } as unknown as ICategory);
  const product = await Product.create({
    name: { ar: "Classic Watch AR", en: "Classic Watch" },
    description: { ar: "Arabic description", en: "English description" },
    slug: "classic-watch",
    gender: "men",
    category: category._id,
    subcategory: subcategory._id,
    price: 1000,
    sku: "KRV-CTRL-001",
    stockQuantity: 20,
    lowStockThreshold: 2,
  });

  await Settings.create({
    depositPercentage: 50,
    instapayNumber: "01000000000",
    vodafoneCashNumber: "01000000001",
    whatsappNumber: "01000000002",
  });

  return { customer, otherCustomer, admin, category, product };
};

const orderPayload = (seed: SeedData, quantity = 2) => ({
  items: [{ productId: idOf(seed.product), quantity }],
  shippingAddress,
  paymentMethod: "vodafone_cash" as const,
  customerPhone: shippingAddress.phone,
});

const createPendingOrder = async (
  seed: SeedData,
  customer: IUser = seed.customer,
): Promise<IOrder> => {
  return createReservation({
    customerId: idOf(customer),
    ...orderPayload(seed),
  });
};

const createReservedOrder = async (seed: SeedData): Promise<IOrder> => {
  const order = await createPendingOrder(seed);

  return confirmDeposit(idOf(order), idOf(seed.admin));
};

const createPackedOrder = async (seed: SeedData): Promise<IOrder> => {
  const order = await createReservedOrder(seed);

  return markPacked(idOf(order), idOf(seed.admin));
};

const createFullyPaidOrder = async (seed: SeedData): Promise<IOrder> => {
  const order = await createPackedOrder(seed);

  return confirmFullPayment(idOf(order), idOf(seed.admin));
};

describe("order controllers", () => {
  let seed: SeedData;

  beforeEach(async () => {
    seed = await seedOrderDependencies();
  });

  describe("customer endpoints", () => {
    it("POST /api/orders creates reservation for authenticated customer", async () => {
      const response = await request(app)
        .post("/api/orders")
        .set("Cookie", authCookie(seed.customer))
        .send(orderPayload(seed))
        .expect(201);

      expect(response.body.data.order).toMatchObject({
        status: "PENDING_DEPOSIT",
        paymentMethod: "vodafone_cash",
        customerPhone: shippingAddress.phone,
        subtotal: 2000,
        depositAmount: 1000,
        refundStatus: "not_required",
      });
      expect(response.body.data.order.orderNumber).toMatch(/^KRV-\d{4}-\d{5}$/);
    });

    it("POST /api/orders rejects without auth", async () => {
      const response = await request(app)
        .post("/api/orders")
        .send(orderPayload(seed))
        .expect(401);

      expect(response.body).toEqual({
        status: "fail",
        message: "You are not logged in",
      });
    });

    it("POST /api/orders rejects invalid items", async () => {
      const response = await request(app)
        .post("/api/orders")
        .set("Cookie", authCookie(seed.customer))
        .send({ ...orderPayload(seed), items: [] })
        .expect(400);

      expect(response.body.message).toContain("At least one item is required");
    });

    it("GET /api/orders/me returns customer's orders", async () => {
      const myOrder = await createPendingOrder(seed);
      await createPendingOrder(seed, seed.otherCustomer);

      const response = await request(app)
        .get("/api/orders/me")
        .set("Cookie", authCookie(seed.customer))
        .expect(200);

      expect(response.body.data.orders).toHaveLength(1);
      expect(response.body.data.orders[0].orderNumber).toBe(myOrder.orderNumber);
    });

    it("GET /api/orders/:id returns order if owner", async () => {
      const order = await createPendingOrder(seed);

      const response = await request(app)
        .get(`/api/orders/${idOf(order)}`)
        .set("Cookie", authCookie(seed.customer))
        .expect(200);

      expect(response.body.data.order.orderNumber).toBe(order.orderNumber);
    });

    it("POST /api/orders/:id/payment-proofs appends proof for owner", async () => {
      const order = await createPendingOrder(seed);

      const response = await request(app)
        .post(`/api/orders/${idOf(order)}/payment-proofs`)
        .set("Cookie", authCookie(seed.customer))
        .send({
          url: "https://res.cloudinary.com/demo/image/upload/proof.jpg",
          label: "Deposit",
        })
        .expect(200);

      expect(response.body.data.order.paymentProofs).toHaveLength(1);
      expect(response.body.data.order.paymentProofs[0]).toMatchObject({
        url: "https://res.cloudinary.com/demo/image/upload/proof.jpg",
        label: "Deposit",
      });
      expect(response.body.data.order.paymentProofs[0].uploadedAt).toBeTruthy();
    });

    it("POST /api/orders/:id/payment-proofs rejects non-owner", async () => {
      const order = await createPendingOrder(seed, seed.otherCustomer);

      const response = await request(app)
        .post(`/api/orders/${idOf(order)}/payment-proofs`)
        .set("Cookie", authCookie(seed.customer))
        .send({
          url: "https://res.cloudinary.com/demo/image/upload/proof.jpg",
        })
        .expect(403);

      expect(response.body).toEqual({
        status: "fail",
        message: "Not authorized",
      });
    });

    it("GET /api/orders/:id returns 403 if not owner", async () => {
      const order = await createPendingOrder(seed, seed.otherCustomer);

      const response = await request(app)
        .get(`/api/orders/${idOf(order)}`)
        .set("Cookie", authCookie(seed.customer))
        .expect(403);

      expect(response.body).toEqual({
        status: "fail",
        message: "Not authorized",
      });
    });
  });

  describe("admin endpoints", () => {
    it("GET /api/admin/orders returns all orders for admin", async () => {
      await createPendingOrder(seed);
      await createPendingOrder(seed, seed.otherCustomer);

      const response = await request(app)
        .get("/api/admin/orders")
        .set("Cookie", authCookie(seed.admin))
        .expect(200);

      expect(response.body.data.orders).toHaveLength(2);
    });

    it("GET /api/admin/orders rejects invalid query filters", async () => {
      const response = await request(app)
        .get("/api/admin/orders?status=UNKNOWN")
        .set("Cookie", authCookie(seed.admin))
        .expect(400);

      expect(response.body.message).toContain("Invalid option");
    });

    it("GET /api/admin/orders returns 403 for customer", async () => {
      const response = await request(app)
        .get("/api/admin/orders")
        .set("Cookie", authCookie(seed.customer))
        .expect(403);

      expect(response.body.message).toBe(
        "You do not have permission to perform this action",
      );
    });

    it("POST /api/admin/orders/:id/confirm-deposit transitions to RESERVED", async () => {
      const order = await createPendingOrder(seed);

      const response = await request(app)
        .post(`/api/admin/orders/${idOf(order)}/confirm-deposit`)
        .set("Cookie", authCookie(seed.admin))
        .expect(200);

      expect(response.body.data.order.status).toBe("RESERVED");
    });

    it("POST /api/admin/orders/:id/mark-packed transitions to PACKED", async () => {
      const order = await createReservedOrder(seed);

      const response = await request(app)
        .post(`/api/admin/orders/${idOf(order)}/mark-packed`)
        .set("Cookie", authCookie(seed.admin))
        .expect(200);

      expect(response.body.data.order.status).toBe("PACKED");
    });

    it("POST /api/admin/orders/:id/confirm-payment transitions to FULLY_PAID", async () => {
      const order = await createPackedOrder(seed);

      const response = await request(app)
        .post(`/api/admin/orders/${idOf(order)}/confirm-payment`)
        .set("Cookie", authCookie(seed.admin))
        .expect(200);

      expect(response.body.data.order.status).toBe("FULLY_PAID");
    });

    it("POST /api/admin/orders/:id/ship transitions to shipped with waybill", async () => {
      const order = await createFullyPaidOrder(seed);

      const response = await request(app)
        .post(`/api/admin/orders/${idOf(order)}/ship`)
        .set("Cookie", authCookie(seed.admin))
        .send({ waybillNumber: "WB-123" })
        .expect(200);

      expect(response.body.data.order).toMatchObject({
        status: "CONFIRMED_SHIPPED",
        waybillNumber: "WB-123",
        shippingStatus: "shipped",
      });
    });

    it("POST /api/admin/orders/:id/cancel transitions to CANCELLED", async () => {
      const order = await createPendingOrder(seed);

      const response = await request(app)
        .post(`/api/admin/orders/${idOf(order)}/cancel`)
        .set("Cookie", authCookie(seed.admin))
        .send({ reason: "Customer requested cancellation" })
        .expect(200);

      expect(response.body.data.order).toMatchObject({
        status: "CANCELLED",
        cancellationReason: "Customer requested cancellation",
      });
    });

    it("POST /api/admin/orders/:id/cancel allows no reason", async () => {
      const order = await createPendingOrder(seed);

      const response = await request(app)
        .post(`/api/admin/orders/${idOf(order)}/cancel`)
        .set("Cookie", authCookie(seed.admin))
        .send({})
        .expect(200);

      expect(response.body.data.order).toMatchObject({
        status: "CANCELLED",
        cancellationReason: null,
      });
    });

    it("POST /api/admin/orders/:id/confirm-deposit throws on invalid state", async () => {
      const order = await createReservedOrder(seed);

      const response = await request(app)
        .post(`/api/admin/orders/${idOf(order)}/confirm-deposit`)
        .set("Cookie", authCookie(seed.admin))
        .expect(400);

      expect(response.body.message).toContain(
        "Cannot transition order from RESERVED to RESERVED",
      );
    });
  });
});
