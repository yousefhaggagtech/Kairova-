import { Types, type QueryFilter } from "mongoose";

import Order, {
  type IOrder,
  type IOrderItem,
  type IShippingAddress,
} from "../../models/Order.js";
import Product, { type IProduct } from "../../models/Product.js";
import Settings from "../../models/Settings.js";
import User from "../../models/User.js";
import AppError from "../../utils/AppError.js";
import { createOrderWithUniqueNumber } from "../_shared/orderNumber.js";
import {
  ORDER_STATUSES,
  canTransition,
  hasDecrementedStock,
  requiresRefund,
  type OrderStatus,
} from "../_shared/orderStateMachine.js";

interface CreateReservationInput {
  customerId: string;
  items: Array<{ productId: string; quantity: number }>;
  shippingAddress: IShippingAddress;
}

interface OrderListFilters {
  status?: OrderStatus;
  customerId?: string;
}

const orderPopulate = [
  { path: "customer", select: "name email phone" },
  { path: "items.product", select: "name slug images" },
];

const toObjectId = (id: string, message: string): Types.ObjectId => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(message, 400);
  }

  return new Types.ObjectId(id);
};

const isOrderStatus = (status: string): status is OrderStatus => {
  return ORDER_STATUSES.includes(status as OrderStatus);
};

const assertTransition = (from: OrderStatus, to: OrderStatus): void => {
  if (!canTransition(from, to)) {
    throw new AppError(`Cannot transition order from ${from} to ${to}`, 400);
  }
};

const getOrderDocumentById = async (orderId: string): Promise<IOrder> => {
  const order = await Order.findById(toObjectId(orderId, "Invalid order id"));

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  return order;
};

const populateOrder = async (order: IOrder): Promise<IOrder> => {
  return order.populate(orderPopulate);
};

const restoreStockForItems = async (items: IOrderItem[]): Promise<void> => {
  await Promise.all(
    items.map((item) =>
      Product.updateOne(
        { _id: item.product },
        { $inc: { stockQuantity: item.quantity } },
      ),
    ),
  );
};

const decrementStockForItems = async (items: IOrderItem[]): Promise<void> => {
  const decrementedItems: IOrderItem[] = [];

  try {
    for (const item of items) {
      const result = await Product.updateOne(
        {
          _id: item.product,
          deletedAt: null,
          stockQuantity: { $gte: item.quantity },
        },
        { $inc: { stockQuantity: -item.quantity } },
      );

      if (result.modifiedCount === 0) {
        throw new AppError(
          `Out of stock for "${item.name.en}" - cancel this reservation`,
          400,
        );
      }

      decrementedItems.push(item);
    }
  } catch (error) {
    await restoreStockForItems(decrementedItems);
    throw error;
  }
};

const buildOrderItems = async (
  inputItems: CreateReservationInput["items"],
): Promise<IOrderItem[]> => {
  if (inputItems.length === 0) {
    throw new AppError("Order requires at least one item", 400);
  }

  const quantitiesByProductId = new Map<string, number>();
  const productObjectIds = new Map<string, Types.ObjectId>();

  for (const item of inputItems) {
    if (item.quantity <= 0) {
      throw new AppError("Quantity must be greater than 0", 400);
    }

    const productObjectId = toObjectId(item.productId, "Invalid product id");
    const productId = productObjectId.toString();
    const requestedQuantity = quantitiesByProductId.get(productId) ?? 0;

    quantitiesByProductId.set(productId, requestedQuantity + item.quantity);
    productObjectIds.set(productId, productObjectId);
  }

  const productsById = new Map<string, IProduct>();

  for (const [productId, quantity] of quantitiesByProductId) {
    const product = await Product.findOne({
      _id: productObjectIds.get(productId),
      deletedAt: null,
    });

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    if (product.stockQuantity < quantity) {
      throw new AppError(`Insufficient stock for "${product.name.en}"`, 400);
    }

    productsById.set(productId, product);
  }

  return inputItems.map((item) => {
    const productObjectId = toObjectId(item.productId, "Invalid product id");
    const product = productsById.get(productObjectId.toString());

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    return {
      product: productObjectId,
      name: product.name,
      unitPrice: product.price,
      quantity: item.quantity,
    };
  });
};

export const createReservation = async (
  input: CreateReservationInput,
): Promise<IOrder> => {
  const customerId = toObjectId(input.customerId, "Invalid customer id");
  const customer = await User.findById(customerId);

  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  const orderItems = await buildOrderItems(input.items);
  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const settings = await Settings.getInstance();
  const depositPercentage = settings.depositPercentage;
  const depositAmount = (subtotal * depositPercentage) / 100;
  const remainingAmount = subtotal - depositAmount;
  const order = await createOrderWithUniqueNumber((orderNumber) =>
    Order.create({
      orderNumber,
      customer: customerId,
      items: orderItems,
      subtotal,
      depositPercentage,
      depositAmount,
      remainingAmount,
      shippingAddress: input.shippingAddress,
      status: "PENDING_DEPOSIT",
      refundStatus: "not_required",
    }),
  );

  return populateOrder(order);
};

export const confirmDeposit = async (
  orderId: string,
  adminId: string,
): Promise<IOrder> => {
  void adminId;

  const order = await getOrderDocumentById(orderId);

  assertTransition(order.status, "RESERVED");
  await decrementStockForItems(order.items);

  try {
    order.status = "RESERVED";
    await order.save();
  } catch (error) {
    await restoreStockForItems(order.items);
    throw error;
  }

  return populateOrder(order);
};

export const markPacked = async (
  orderId: string,
  adminId: string,
): Promise<IOrder> => {
  void adminId;

  const order = await getOrderDocumentById(orderId);

  assertTransition(order.status, "PACKED");
  order.status = "PACKED";
  await order.save();

  return populateOrder(order);
};

export const confirmFullPayment = async (
  orderId: string,
  adminId: string,
): Promise<IOrder> => {
  void adminId;

  const order = await getOrderDocumentById(orderId);

  assertTransition(order.status, "FULLY_PAID");
  order.status = "FULLY_PAID";
  await order.save();

  return populateOrder(order);
};

export const shipOrder = async (
  orderId: string,
  adminId: string,
  waybillNumber: string,
): Promise<IOrder> => {
  void adminId;

  const order = await getOrderDocumentById(orderId);

  assertTransition(order.status, "CONFIRMED_SHIPPED");

  if (order.shippingStatus === "manual_required") {
    throw new AppError("Shipping requires manual follow-up before retrying", 400);
  }

  order.status = "CONFIRMED_SHIPPED";
  order.waybillNumber = waybillNumber;
  order.shippingStatus = "shipped";
  await order.save();

  return populateOrder(order);
};

export const cancelOrder = async (
  orderId: string,
  adminId: string,
  reason: string,
): Promise<IOrder> => {
  void adminId;

  const order = await getOrderDocumentById(orderId);

  assertTransition(order.status, "CANCELLED");

  const previousStatus = order.status;

  if (hasDecrementedStock(previousStatus)) {
    await restoreStockForItems(order.items);
  }

  order.status = "CANCELLED";
  order.cancellationReason = reason;
  order.refundStatus = requiresRefund(previousStatus) ? "pending" : "not_required";
  await order.save();

  return populateOrder(order);
};

export const getOrderById = async (orderId: string): Promise<IOrder> => {
  const order = await getOrderDocumentById(orderId);

  return populateOrder(order);
};

export const getOrdersByCustomer = async (
  customerId: string,
): Promise<IOrder[]> => {
  return Order.find({ customer: toObjectId(customerId, "Invalid customer id") })
    .sort({ createdAt: -1 })
    .populate({ path: "items.product", select: "name slug images" });
};

export const listAllOrders = async (
  filters: OrderListFilters = {},
): Promise<IOrder[]> => {
  const query: QueryFilter<IOrder> = {};

  if (filters.status) {
    if (!isOrderStatus(filters.status)) {
      throw new AppError("Invalid order status", 400);
    }

    query.status = filters.status;
  }

  if (filters.customerId) {
    query.customer = toObjectId(filters.customerId, "Invalid customer id");
  }

  return Order.find(query).sort({ createdAt: -1 }).populate(orderPopulate);
};
