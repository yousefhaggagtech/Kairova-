import type { Request, Response } from "express";

import type { IOrder } from "../../models/Order.js";
import AppError from "../../utils/AppError.js";
import { catchError } from "../../utils/catchError.js";
import {
  addPaymentProof,
  cancelOrder,
  confirmDeposit,
  confirmFullPayment,
  createReservation,
  getOrderById,
  getOrdersByCustomer,
  listAllOrders,
  markPacked,
  shipOrder,
} from "./service.js";
import type {
  AddPaymentProofInput,
  CancelOrderInput,
  CreateOrderInput,
  OrderFiltersInput,
  ShipOrderInput,
} from "./validation.js";

const requireUserId = (req: Request): string => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  return req.user.id;
};

const getOrderCustomerId = (order: IOrder): string => {
  const customer = order.customer as unknown as {
    _id?: { toString(): string };
    id?: string;
    toString(): string;
  };

  return customer.id ?? customer._id?.toString() ?? customer.toString();
};

export const createOrderController = catchError(
  async (req: Request, res: Response) => {
    const customerId = requireUserId(req);
    const input = req.body as CreateOrderInput;
    const order = await createReservation({
      customerId,
      items: input.items,
      shippingAddress: input.shippingAddress,
      paymentMethod: input.paymentMethod,
      customerPhone: input.customerPhone,
    });

    res.status(201).json({
      status: "success",
      data: { order },
    });
  },
);

export const getMyOrdersController = catchError(
  async (req: Request, res: Response) => {
    const customerId = requireUserId(req);
    const orders = await getOrdersByCustomer(customerId);

    res.status(200).json({
      status: "success",
      data: { orders },
    });
  },
);

export const getMyOrderByIdController = catchError(
  async (req: Request, res: Response) => {
    const customerId = requireUserId(req);
    const order = await getOrderById(String(req.params.id));

    if (getOrderCustomerId(order) !== customerId) {
      throw new AppError("Not authorized", 403);
    }

    res.status(200).json({
      status: "success",
      data: { order },
    });
  },
);

export const addPaymentProofController = catchError(
  async (req: Request, res: Response) => {
    const customerId = requireUserId(req);
    const input = req.body as AddPaymentProofInput;
    const order = await addPaymentProof(String(req.params.id), customerId, {
      url: input.url,
      label: input.label,
    });

    res.status(200).json({
      status: "success",
      data: { order },
    });
  },
);

export const listAllOrdersController = catchError(
  async (req: Request, res: Response) => {
    const filters = req.query as OrderFiltersInput;
    const orders = await listAllOrders(filters);

    res.status(200).json({
      status: "success",
      data: { orders },
    });
  },
);

export const getOrderByIdController = catchError(
  async (req: Request, res: Response) => {
    const order = await getOrderById(String(req.params.id));

    res.status(200).json({
      status: "success",
      data: { order },
    });
  },
);

export const confirmDepositController = catchError(
  async (req: Request, res: Response) => {
    const order = await confirmDeposit(
      String(req.params.id),
      requireUserId(req),
    );

    res.status(200).json({
      status: "success",
      data: { order },
    });
  },
);

export const markPackedController = catchError(
  async (req: Request, res: Response) => {
    const order = await markPacked(String(req.params.id), requireUserId(req));

    res.status(200).json({
      status: "success",
      data: { order },
    });
  },
);

export const confirmPaymentController = catchError(
  async (req: Request, res: Response) => {
    const order = await confirmFullPayment(
      String(req.params.id),
      requireUserId(req),
    );

    res.status(200).json({
      status: "success",
      data: { order },
    });
  },
);

export const shipOrderController = catchError(
  async (req: Request, res: Response) => {
    const input = req.body as ShipOrderInput;
    const order = await shipOrder(
      String(req.params.id),
      requireUserId(req),
      input.waybillNumber,
    );

    res.status(200).json({
      status: "success",
      data: { order },
    });
  },
);

export const cancelOrderController = catchError(
  async (req: Request, res: Response) => {
    const input = req.body as CancelOrderInput;
    const order = await cancelOrder(
      String(req.params.id),
      requireUserId(req),
      input.reason,
    );

    res.status(200).json({
      status: "success",
      data: { order },
    });
  },
);
