import mongoose from "mongoose";

import Order from "./Order.js";
import Settings from "./Settings.js";

const validOrderInput = (overrides: Record<string, unknown> = {}) => ({
  orderNumber: `ORD-${new mongoose.Types.ObjectId().toString()}`,
  customer: new mongoose.Types.ObjectId(),
  items: [
    {
      product: new mongoose.Types.ObjectId(),
      name: { ar: "Classic Watch AR", en: "Classic Watch" },
      unitPrice: 1000,
      quantity: 1,
    },
  ],
  subtotal: 1000,
  depositPercentage: 50,
  depositAmount: 500,
  remainingAmount: 500,
  paymentMethod: "vodafone_cash" as const,
  customerPhone: "+201001234567",
  paymentProofs: [],
  shippingAddress: {
    nickname: "Home",
    fullName: "Yousef Haggag",
    phone: "+201001234567",
    city: "Cairo",
    area: "Zamalek",
    street: "12 Nile Street",
    building: "12",
  },
  ...overrides,
});

const expectValidationError = async (
  document: mongoose.Document,
  path: string,
) => {
  let validationError: mongoose.Error.ValidationError | undefined;

  try {
    await document.validate();
  } catch (error) {
    validationError = error as mongoose.Error.ValidationError;
  }

  expect(validationError).toBeInstanceOf(mongoose.Error.ValidationError);
  expect(validationError?.errors[path]).toBeDefined();
};

describe("Order model", () => {
  it("requires customer, items, and shippingAddress", async () => {
    await expectValidationError(
      new Order(validOrderInput({ customer: undefined })),
      "customer",
    );
    await expectValidationError(
      new Order(validOrderInput({ items: [] })),
      "items",
    );
    await expectValidationError(
      new Order(validOrderInput({ shippingAddress: undefined })),
      "shippingAddress",
    );
  });

  it("defaults to PENDING_DEPOSIT status", async () => {
    const order = await Order.create(validOrderInput());

    expect(order.status).toBe("PENDING_DEPOSIT");
  });

  it("defaults refundStatus to not_required", async () => {
    const order = await Order.create(validOrderInput());

    expect(order.refundStatus).toBe("not_required");
  });

  it("defaults paymentProofs to an empty array", async () => {
    const order = await Order.create(
      validOrderInput({ paymentProofs: undefined }),
    );

    expect(order.paymentProofs).toEqual([]);
  });

  it("accepts legacy shipping address snapshots", async () => {
    const order = await Order.create(
      validOrderInput({
        shippingAddress: {
          label: "Home",
          street: "12 Nile Street",
          city: "Cairo",
          governorate: "Cairo",
          phone: "+201001234567",
        },
      }),
    );

    expect(order.shippingAddress.label).toBe("Home");
  });

  it("creates a unique index for orderNumber", async () => {
    await Order.syncIndexes();

    const indexes = await Order.collection.indexes();

    expect(indexes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: { orderNumber: 1 },
          unique: true,
        }),
      ]),
    );
  });

  it("rejects invalid status enum values", async () => {
    await expectValidationError(
      new Order(validOrderInput({ status: "UNKNOWN_STATUS" })),
      "status",
    );
  });

  it("rejects invalid payment method enum values", async () => {
    await expectValidationError(
      new Order(validOrderInput({ paymentMethod: "cash" })),
      "paymentMethod",
    );
  });

  it("rejects depositPercentage greater than 100", async () => {
    await expectValidationError(
      new Order(validOrderInput({ depositPercentage: 101 })),
      "depositPercentage",
    );
  });

  it("keeps subtotal, depositAmount, and remainingAmount consistent", async () => {
    const order = await Order.create(
      validOrderInput({
        subtotal: 1250,
        depositPercentage: 40,
        depositAmount: 500,
        remainingAmount: 750,
      }),
    );

    expect(order.depositAmount).toBe(
      (order.subtotal * order.depositPercentage) / 100,
    );
    expect(order.depositAmount + order.remainingAmount).toBe(order.subtotal);
  });
});

describe("Settings model", () => {
  it("getInstance creates defaults if none exist", async () => {
    const settings = await Settings.getInstance();

    expect(settings.depositPercentage).toBe(50);
    expect(settings.instapayNumber).toBe("");
    expect(settings.vodafoneCashNumber).toBe("");
    expect(settings.whatsappNumber).toBe("");
    expect(settings.jtApiUrl).toBeNull();
    expect(settings.jtUsername).toBeNull();
    expect(settings.jtApiKey).toBeNull();
  });

  it("getInstance returns the existing settings document on the second call", async () => {
    const firstSettings = await Settings.getInstance();
    firstSettings.instapayNumber = "01000000000";
    await firstSettings.save();

    const secondSettings = await Settings.getInstance();

    expect(secondSettings._id.toString()).toBe(firstSettings._id.toString());
    expect(secondSettings.instapayNumber).toBe("01000000000");
  });
});
