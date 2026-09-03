import { z } from "zod";

export const paymentMethodSchema = z.enum(["vodafone_cash", "instapay"]);

export const addressSchema = z.object({
  nickname: z.string().trim().max(60).optional(),
  fullName: z.string().trim().min(1, "Full name is required").max(100),
  phone: z.string().trim().regex(/^\+?[0-9]{10,15}$/, "Invalid phone format"),
  city: z.string().trim().min(1, "City is required").max(50),
  area: z.string().trim().max(80).optional(),
  street: z.string().trim().min(1, "Street is required").max(200),
  building: z.string().trim().max(50).optional(),
  floor: z.string().trim().max(50).optional(),
  apartment: z.string().trim().max(50).optional(),
  notes: z.string().trim().max(500).optional(),
});

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product ID is required"),
        quantity: z.number().int().min(1, "Quantity must be at least 1"),
      }),
    )
    .min(1, "At least one item is required"),
  shippingAddress: addressSchema,
  paymentMethod: paymentMethodSchema,
  customerPhone: z.string().trim().regex(/^\+?[0-9]{10,15}$/, "Invalid phone format"),
});

export const addPaymentProofSchema = z.object({
  url: z.string().trim().url("Invalid proof URL"),
  label: z.string().trim().min(1).max(60).optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.preprocess(
    (value) =>
      typeof value === "string" && value.trim().length === 0
        ? undefined
        : value,
    z.string().trim().max(500).optional(),
  ),
});

export const shipOrderSchema = z.object({
  waybillNumber: z.string().min(1, "Waybill number is required"),
});

export const orderFiltersSchema = z.object({
  status: z
    .enum([
      "PENDING_DEPOSIT",
      "RESERVED",
      "PACKED",
      "FULLY_PAID",
      "CONFIRMED_SHIPPED",
      "CANCELLED",
    ])
    .optional(),
  customerId: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type AddPaymentProofInput = z.infer<typeof addPaymentProofSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
export type ShipOrderInput = z.infer<typeof shipOrderSchema>;
export type OrderFiltersInput = z.infer<typeof orderFiltersSchema>;
