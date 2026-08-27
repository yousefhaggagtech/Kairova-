import mongoose from "mongoose";

import Category, { type ICategory } from "../../models/Category.js";
import Order, { type IOrder, type IShippingAddress } from "../../models/Order.js";
import Product, { type IProduct } from "../../models/Product.js";
import Settings from "../../models/Settings.js";
import User, { type IUser } from "../../models/User.js";
import AppError from "../../utils/AppError.js";
import {
  createOrderWithUniqueNumber,
  generateOrderNumber,
} from "../_shared/orderNumber.js";
import {
  ORDER_STATUSES,
  VALID_TRANSITIONS,
  canTransition,
} from "../_shared/orderStateMachine.js";
import {
  addPaymentProof,
  cancelOrder,
  confirmDeposit,
  confirmFullPayment,
  createReservation,
  markPacked,
  shipOrder,
} from "./service.js";

interface SeedData {
  customer: IUser;
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

const duplicateOrderNumberError = () =>
  Object.assign(new Error("Duplicate order number"), {
    code: 11000,
    keyPattern: { orderNumber: 1 },
  });

const idOf = (document: { _id: unknown }): string => String(document._id);

const seedOrderDependencies = async (): Promise<SeedData> => {
  const [customer, admin] = await User.insertMany([
    {
      name: "Test Customer",
      email: "customer@example.com",
      password: "password123",
      phone: "+201001234567",
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
    sku: "KRV-TEST-001",
    stockQuantity: 10,
    lowStockThreshold: 2,
  });

  await Settings.create({
    depositPercentage: 50,
    instapayNumber: "01000000000",
    vodafoneCashNumber: "01000000001",
    whatsappNumber: "01000000002",
  });

  return { customer, admin, category, product };
};

const reservationInput = (
  seed: SeedData,
  overrides: Partial<Parameters<typeof createReservation>[0]> = {},
): Parameters<typeof createReservation>[0] => ({
  customerId: idOf(seed.customer),
  items: [{ productId: idOf(seed.product), quantity: 2 }],
  shippingAddress,
  paymentMethod: "vodafone_cash",
  customerPhone: shippingAddress.phone,
  ...overrides,
});

const createPendingOrder = async (
  seed: SeedData,
  quantity = 2,
): Promise<IOrder> =>
  createReservation(
    reservationInput(seed, {
      items: [{ productId: idOf(seed.product), quantity }],
    }),
  );

const createReservedOrder = async (
  seed: SeedData,
  quantity = 2,
): Promise<IOrder> => {
  const order = await createPendingOrder(seed, quantity);

  return confirmDeposit(idOf(order), idOf(seed.admin));
};

const createPackedOrder = async (
  seed: SeedData,
  quantity = 2,
): Promise<IOrder> => {
  const order = await createReservedOrder(seed, quantity);

  return markPacked(idOf(order), idOf(seed.admin));
};

const createFullyPaidOrder = async (
  seed: SeedData,
  quantity = 2,
): Promise<IOrder> => {
  const order = await createPackedOrder(seed, quantity);

  return confirmFullPayment(idOf(order), idOf(seed.admin));
};

const createStoredOrder = async (
  seed: SeedData,
  orderNumber: string,
): Promise<IOrder> =>
  Order.create({
    orderNumber,
    customer: seed.customer._id,
    items: [
      {
        product: seed.product._id,
        name: seed.product.name,
        unitPrice: seed.product.price,
        quantity: 1,
      },
    ],
    subtotal: 1000,
    depositPercentage: 50,
    depositAmount: 500,
    remainingAmount: 500,
    paymentMethod: "vodafone_cash",
    customerPhone: shippingAddress.phone,
    paymentProofs: [],
    shippingAddress,
    refundStatus: "not_required",
  });

describe("order service", () => {
  let seed: SeedData;

  beforeEach(async () => {
    seed = await seedOrderDependencies();
  });

  describe("createReservation", () => {
    it("creates order with PENDING_DEPOSIT status", async () => {
      const order = await createPendingOrder(seed);

      expect(order.status).toBe("PENDING_DEPOSIT");
    });

    it("snapshots product name and unitPrice", async () => {
      const order = await createPendingOrder(seed);

      expect(order.items[0]?.name.ar).toBe(seed.product.name.ar);
      expect(order.items[0]?.name.en).toBe(seed.product.name.en);
      expect(order.items[0]?.unitPrice).toBe(seed.product.price);
    });

    it("calculates correct depositAmount", async () => {
      const order = await createPendingOrder(seed, 3);

      expect(order.subtotal).toBe(3000);
      expect(order.depositAmount).toBe(1500);
      expect(order.remainingAmount).toBe(1500);
    });

    it("generates unique orderNumber with correct prefix", async () => {
      const firstOrder = await createPendingOrder(seed);
      const secondOrder = await createPendingOrder(seed);
      const year = new Date().getFullYear();

      expect(firstOrder.orderNumber).toBe(`KRV-${year}-00001`);
      expect(secondOrder.orderNumber).toBe(`KRV-${year}-00002`);
    });

    it("does not decrement stock at creation", async () => {
      await createPendingOrder(seed, 4);

      const product = await Product.findById(idOf(seed.product));

      expect(product?.stockQuantity).toBe(10);
    });

    it("throws if product does not exist", async () => {
      await expect(
        createReservation(
          reservationInput(seed, {
            items: [
              {
                productId: new mongoose.Types.ObjectId().toString(),
                quantity: 1,
              },
            ],
          }),
        ),
      ).rejects.toMatchObject({
        statusCode: 404,
        message: "Product not found",
      });
    });

    it("throws if product is deleted", async () => {
      seed.product.deletedAt = new Date();
      await seed.product.save();

      await expect(createPendingOrder(seed)).rejects.toMatchObject({
        statusCode: 404,
        message: "Product not found",
      });
    });

    it("sets refundStatus to not_required", async () => {
      const order = await createPendingOrder(seed);

      expect(order.refundStatus).toBe("not_required");
    });

    it("stores selected payment method and checkout phone", async () => {
      const order = await createReservation(
        reservationInput(seed, {
          paymentMethod: "instapay",
          customerPhone: "+201555555555",
        }),
      );

      expect(order.paymentMethod).toBe("instapay");
      expect(order.customerPhone).toBe("+201555555555");
    });
  });

  describe("addPaymentProof", () => {
    it("appends payment proofs without overwriting previous uploads", async () => {
      const order = await createPendingOrder(seed);

      const firstResult = await addPaymentProof(
        idOf(order),
        idOf(seed.customer),
        {
          url: "https://res.cloudinary.com/demo/image/upload/proof-1.jpg",
          label: "Deposit",
        },
      );
      const secondResult = await addPaymentProof(
        idOf(order),
        idOf(seed.customer),
        {
          url: "https://res.cloudinary.com/demo/image/upload/proof-2.jpg",
          label: "Remaining balance",
        },
      );

      expect(firstResult.paymentProofs).toHaveLength(1);
      expect(secondResult.paymentProofs).toHaveLength(2);
      expect(secondResult.paymentProofs).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ label: "Deposit" }),
          expect.objectContaining({ label: "Remaining balance" }),
        ]),
      );
    });

    it("rejects proof uploads from another customer", async () => {
      const otherCustomer = await User.create({
        name: "Other Customer",
        email: "other-proof@example.com",
        password: "password123",
        phone: "+201001111111",
        role: "customer",
      });
      const order = await createPendingOrder(seed);

      await expect(
        addPaymentProof(idOf(order), idOf(otherCustomer), {
          url: "https://res.cloudinary.com/demo/image/upload/proof.jpg",
        }),
      ).rejects.toMatchObject({
        statusCode: 403,
        message: "Not authorized",
      });
    });
  });

  describe("confirmDeposit", () => {
    it("transitions PENDING_DEPOSIT to RESERVED", async () => {
      const order = await createPendingOrder(seed);
      const result = await confirmDeposit(idOf(order), idOf(seed.admin));

      expect(result.status).toBe("RESERVED");
    });

    it("decrements stock atomically", async () => {
      const order = await createPendingOrder(seed, 3);

      await confirmDeposit(idOf(order), idOf(seed.admin));

      const product = await Product.findById(idOf(seed.product));

      expect(product?.stockQuantity).toBe(7);
    });

    it("throws a clear Out of stock error when stock is depleted", async () => {
      const order = await createPendingOrder(seed, 10);
      await Product.updateOne({ _id: seed.product._id }, { stockQuantity: 0 });

      await expect(
        confirmDeposit(idOf(order), idOf(seed.admin)),
      ).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining("Out of stock"),
      });
    });

    it("allows first concurrent reservation confirmation and fails the second", async () => {
      const firstOrder = await createPendingOrder(seed, 6);
      const secondOrder = await createPendingOrder(seed, 6);

      await expect(confirmDeposit(idOf(firstOrder), idOf(seed.admin))).resolves
        .toHaveProperty("status", "RESERVED");
      await expect(
        confirmDeposit(idOf(secondOrder), idOf(seed.admin)),
      ).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining("Out of stock"),
      });

      const product = await Product.findById(idOf(seed.product));
      const secondOrderAfterFailure = await Order.findById(idOf(secondOrder));

      expect(product?.stockQuantity).toBe(4);
      expect(secondOrderAfterFailure?.status).toBe("PENDING_DEPOSIT");
    });

    it("throws if order is not in PENDING_DEPOSIT", async () => {
      const order = await createReservedOrder(seed);

      await expect(
        confirmDeposit(idOf(order), idOf(seed.admin)),
      ).rejects.toMatchObject({
        statusCode: 400,
      });
    });
  });

  describe("markPacked", () => {
    it("transitions RESERVED to PACKED", async () => {
      const order = await createReservedOrder(seed);
      const result = await markPacked(idOf(order), idOf(seed.admin));

      expect(result.status).toBe("PACKED");
    });

    it("throws if order is not in RESERVED", async () => {
      const order = await createPendingOrder(seed);

      await expect(
        markPacked(idOf(order), idOf(seed.admin)),
      ).rejects.toMatchObject({
        statusCode: 400,
      });
    });
  });

  describe("confirmFullPayment", () => {
    it("transitions PACKED to FULLY_PAID", async () => {
      const order = await createPackedOrder(seed);
      const result = await confirmFullPayment(idOf(order), idOf(seed.admin));

      expect(result.status).toBe("FULLY_PAID");
    });

    it("throws if order is not in PACKED", async () => {
      const order = await createReservedOrder(seed);

      await expect(
        confirmFullPayment(idOf(order), idOf(seed.admin)),
      ).rejects.toMatchObject({
        statusCode: 400,
      });
    });
  });

  describe("shipOrder", () => {
    it("transitions FULLY_PAID to CONFIRMED_SHIPPED", async () => {
      const order = await createFullyPaidOrder(seed);
      const result = await shipOrder(idOf(order), idOf(seed.admin), "WB-123");

      expect(result.status).toBe("CONFIRMED_SHIPPED");
    });

    it("stores waybillNumber", async () => {
      const order = await createFullyPaidOrder(seed);
      const result = await shipOrder(idOf(order), idOf(seed.admin), "WB-123");

      expect(result.waybillNumber).toBe("WB-123");
    });

    it("sets shippingStatus to shipped", async () => {
      const order = await createFullyPaidOrder(seed);
      const result = await shipOrder(idOf(order), idOf(seed.admin), "WB-123");

      expect(result.shippingStatus).toBe("shipped");
    });

    it("throws if order is not in FULLY_PAID", async () => {
      const order = await createPackedOrder(seed);

      await expect(
        shipOrder(idOf(order), idOf(seed.admin), "WB-123"),
      ).rejects.toMatchObject({
        statusCode: 400,
      });
    });

    it("throws if shipping requires manual follow-up", async () => {
      const order = await createFullyPaidOrder(seed);

      order.shippingStatus = "manual_required";
      await order.save();

      await expect(
        shipOrder(idOf(order), idOf(seed.admin), "WB-123"),
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Shipping requires manual follow-up before retrying",
      });
    });
  });

  describe("cancelOrder", () => {
    it("cancels PENDING_DEPOSIT with not_required refund and no stock change", async () => {
      const order = await createPendingOrder(seed, 3);
      const result = await cancelOrder(
        idOf(order),
        idOf(seed.admin),
        "Customer asked",
      );
      const product = await Product.findById(idOf(seed.product));

      expect(result.status).toBe("CANCELLED");
      expect(result.refundStatus).toBe("not_required");
      expect(product?.stockQuantity).toBe(10);
    });

    it("cancels RESERVED with pending refund and restores stock", async () => {
      const order = await createReservedOrder(seed, 3);
      const result = await cancelOrder(
        idOf(order),
        idOf(seed.admin),
        "Customer asked",
      );
      const product = await Product.findById(idOf(seed.product));

      expect(result.status).toBe("CANCELLED");
      expect(result.refundStatus).toBe("pending");
      expect(product?.stockQuantity).toBe(10);
    });

    it("cancels PACKED with pending refund and restores stock", async () => {
      const order = await createPackedOrder(seed, 3);
      const result = await cancelOrder(
        idOf(order),
        idOf(seed.admin),
        "Customer asked",
      );
      const product = await Product.findById(idOf(seed.product));

      expect(result.status).toBe("CANCELLED");
      expect(result.refundStatus).toBe("pending");
      expect(product?.stockQuantity).toBe(10);
    });

    it("cancels FULLY_PAID with pending refund and restores stock", async () => {
      const order = await createFullyPaidOrder(seed, 3);
      const result = await cancelOrder(
        idOf(order),
        idOf(seed.admin),
        "Customer asked",
      );
      const product = await Product.findById(idOf(seed.product));

      expect(result.status).toBe("CANCELLED");
      expect(result.refundStatus).toBe("pending");
      expect(product?.stockQuantity).toBe(10);
    });

    it("throws when cancelling CONFIRMED_SHIPPED", async () => {
      const order = await createFullyPaidOrder(seed);
      const shippedOrder = await shipOrder(
        idOf(order),
        idOf(seed.admin),
        "WB-123",
      );

      await expect(
        cancelOrder(idOf(shippedOrder), idOf(seed.admin), "Too late"),
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Cannot transition order from CONFIRMED_SHIPPED to CANCELLED",
      });
    });

    it("throws when cancelling CANCELLED", async () => {
      const order = await createPendingOrder(seed);
      const cancelledOrder = await cancelOrder(
        idOf(order),
        idOf(seed.admin),
        "Customer asked",
      );

      await expect(
        cancelOrder(idOf(cancelledOrder), idOf(seed.admin), "Again"),
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Cannot transition order from CANCELLED to CANCELLED",
      });
    });
  });
});

describe("createOrderWithUniqueNumber", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("retries on duplicate key errors", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation();
    let attempts = 0;

    const result = await createOrderWithUniqueNumber(async (orderNumber) => {
      attempts += 1;

      if (attempts <= 2) {
        throw duplicateOrderNumberError();
      }

      return orderNumber;
    });

    expect(attempts).toBe(3);
    expect(result).toMatch(/^KRV-\d{4}-\d{5}$/);
    expect(warnSpy).toHaveBeenCalledTimes(2);
  });

  it("throws AppError after max retries", async () => {
    jest.spyOn(console, "warn").mockImplementation();
    let attempts = 0;

    await expect(
      createOrderWithUniqueNumber(async () => {
        attempts += 1;
        throw duplicateOrderNumberError();
      }, 2),
    ).rejects.toBeInstanceOf(AppError);

    expect(attempts).toBe(2);
  });

  it("does not retry on non-duplicate errors", async () => {
    const error = new Error("Database unavailable");
    let attempts = 0;

    await expect(
      createOrderWithUniqueNumber(async () => {
        attempts += 1;
        throw error;
      }),
    ).rejects.toBe(error);

    expect(attempts).toBe(1);
  });
});

describe("order state machine", () => {
  it("returns true for valid transitions", () => {
    for (const [from, transitions] of Object.entries(VALID_TRANSITIONS)) {
      for (const to of transitions) {
        expect(canTransition(from as (typeof ORDER_STATUSES)[number], to)).toBe(
          true,
        );
      }
    }
  });

  it("returns false for invalid transitions", () => {
    expect(canTransition("PENDING_DEPOSIT", "PACKED")).toBe(false);
    expect(canTransition("CANCELLED", "RESERVED")).toBe(false);
  });

  it("matches the transition table for every status pair", () => {
    for (const from of ORDER_STATUSES) {
      for (const to of ORDER_STATUSES) {
        expect(canTransition(from, to)).toBe(
          VALID_TRANSITIONS[from].includes(to),
        );
      }
    }
  });
});

describe("generateOrderNumber", () => {
  let seed: SeedData;

  beforeEach(async () => {
    seed = await seedOrderDependencies();
  });

  it("returns KRV-YEAR-NNNNN format", async () => {
    const year = new Date().getFullYear();
    const orderNumber = await generateOrderNumber();

    expect(orderNumber).toBe(`KRV-${year}-00001`);
    expect(orderNumber).toMatch(new RegExp(`^KRV-${year}-\\d{5}$`));
  });

  it("increments sequentially", async () => {
    const year = new Date().getFullYear();

    await createStoredOrder(seed, `KRV-${year}-00001`);

    await expect(generateOrderNumber()).resolves.toBe(`KRV-${year}-00002`);
  });
});
