import {
  Schema,
  model,
  Document,
  type Model,
  type QueryWithHelpers,
  type Types,
} from "mongoose";

import type { LocalizedString } from "../types/localized.js";
import { localizedField } from "./_fragments.js";

export type OrderStatus =
  | "PENDING_DEPOSIT"
  | "RESERVED"
  | "PACKED"
  | "FULLY_PAID"
  | "CONFIRMED_SHIPPED"
  | "CANCELLED";

export type ShippingStatus = "pending" | "shipped" | "manual_required" | null;

export type RefundStatus = "not_required" | "pending" | "completed";

export type PaymentMethod = "vodafone_cash" | "instapay";

export interface IOrderItem {
  product: Types.ObjectId;
  name: LocalizedString;
  unitPrice: number;
  quantity: number;
}

export interface IPaymentProof {
  url: string;
  uploadedAt: Date;
  label?: string;
}

export interface IShippingAddress {
  nickname?: string;
  fullName?: string;
  phone: string;
  city: string;
  area?: string;
  street: string;
  building?: string;
  floor?: string;
  apartment?: string;
  notes?: string;
  label?: string;
  governorate?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  customer: Types.ObjectId;
  paymentMethod: PaymentMethod;
  customerPhone: string;
  paymentProofs: IPaymentProof[];
  items: IOrderItem[];
  subtotal: number;
  depositPercentage: number;
  depositAmount: number;
  remainingAmount: number;
  status: OrderStatus;
  shippingAddress: IShippingAddress;
  waybillNumber: string | null;
  shippingStatus: ShippingStatus;
  cancellationReason: string | null;
  refundStatus: RefundStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface OrderQueryHelpers {
  active(
    this: QueryWithHelpers<IOrder[], IOrder, OrderQueryHelpers, IOrder, "find">,
  ): QueryWithHelpers<IOrder[], IOrder, OrderQueryHelpers, IOrder, "find">;
}

type OrderModel = Model<IOrder, OrderQueryHelpers>;

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: localizedField,
      required: true,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false },
);

const shippingAddressSchema = new Schema<IShippingAddress>(
  {
    nickname: {
      type: String,
      trim: true,
      maxlength: 60,
    },
    fullName: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    area: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    street: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    building: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    floor: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    apartment: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    label: {
      type: String,
      trim: true,
      maxlength: 60,
    },
    governorate: {
      type: String,
      trim: true,
      maxlength: 50,
    },
  },
  { _id: false },
);

const paymentProofSchema = new Schema<IPaymentProof>(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    uploadedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    label: {
      type: String,
      trim: true,
    },
  },
  { _id: false },
);

const orderSchema = new Schema<
  IOrder,
  OrderModel,
  Record<string, never>,
  OrderQueryHelpers
>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["vodafone_cash", "instapay"],
      default: "vodafone_cash",
      required: true,
    },
    customerPhone: {
      type: String,
      default: "",
      required: true,
      trim: true,
    },
    paymentProofs: {
      type: [paymentProofSchema],
      default: [],
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator(items: IOrderItem[]) {
          return items.length > 0;
        },
        message: "Order requires at least one item",
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    depositPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    depositAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    remainingAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: [
        "PENDING_DEPOSIT",
        "RESERVED",
        "PACKED",
        "FULLY_PAID",
        "CONFIRMED_SHIPPED",
        "CANCELLED",
      ],
      default: "PENDING_DEPOSIT",
      required: true,
      index: true,
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    waybillNumber: {
      type: String,
      default: null,
    },
    shippingStatus: {
      type: String,
      enum: ["pending", "shipped", "manual_required", null],
      default: null,
    },
    cancellationReason: {
      type: String,
      default: null,
    },
    refundStatus: {
      type: String,
      enum: ["not_required", "pending", "completed"],
      default: "not_required",
      required: true,
    },
    notes: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

orderSchema.query.active = function active() {
  return this.where({ status: { $ne: "CANCELLED" } });
};

export const Order = model<IOrder, OrderModel>("Order", orderSchema);

export default Order;
