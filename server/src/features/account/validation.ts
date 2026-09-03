import { z } from "zod";

const phoneRegex = /^\+?[0-9]{10,15}$/;
const objectIdRegex = /^[a-f\d]{24}$/i;

const optionalText = (maxLength: number) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim().length === 0
        ? undefined
        : value,
    z.string().trim().max(maxLength).optional(),
  );

export const addressInputSchema = z
  .object({
    nickname: optionalText(60),
    fullName: z.string().trim().min(1, "Full name is required").max(100),
    phone: z
      .string()
      .regex(phoneRegex, "Phone must be 10-15 digits, optional + prefix")
      .trim(),
    city: z.string().trim().min(1, "City is required").max(50),
    area: optionalText(80),
    street: z.string().trim().min(1, "Street is required").max(200),
    building: optionalText(50),
    floor: optionalText(50),
    apartment: optionalText(50),
    notes: optionalText(500),
    isDefault: z.boolean().optional(),
  })
  .strict();

export const updateAddressSchema = addressInputSchema
  .omit({ isDefault: true })
  .partial()
  .refine((input) => Object.keys(input).length > 0, {
    message: "At least one address field is required",
  });

export const addressIdParamsSchema = z.object({
  addressId: z.string().regex(objectIdRegex, "Invalid address id"),
});

export type AddressInput = z.infer<typeof addressInputSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
