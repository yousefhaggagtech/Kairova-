import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().min(1, "Label is required").max(30),
  street: z.string().min(1, "Street is required").max(200),
  city: z.string().min(1, "City is required").max(50),
  governorate: z.string().min(1, "Governorate is required").max(50),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/, "Invalid phone format"),
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
});

export const cancelOrderSchema = z.object({
  reason: z
    .string()
    .min(1, "Cancellation reason is required")
    .max(500),
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
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
export type ShipOrderInput = z.infer<typeof shipOrderSchema>;
export type OrderFiltersInput = z.infer<typeof orderFiltersSchema>;
