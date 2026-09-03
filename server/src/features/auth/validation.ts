import { z } from "zod";

const phoneRegex = /^\+?[0-9]{10,15}$/;

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters")
    .trim(),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be at most 100 characters"),
  phone: z
    .string()
    .regex(phoneRegex, "Phone must be 10-15 digits, optional + prefix")
    .trim(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const updateProfileSchema = z
  .object({
    name: z.string().min(2).max(50).trim().optional(),
    phone: z.string().regex(phoneRegex).trim().optional(),
    addresses: z
      .array(
        z.object({
          nickname: z.string().min(1).max(60).optional(),
          fullName: z.string().min(1).max(100),
          phone: z.string().regex(phoneRegex),
          city: z.string().min(1).max(50),
          area: z.string().min(1).max(80).optional(),
          street: z.string().min(1).max(200),
          building: z.string().min(1).max(50).optional(),
          floor: z.string().min(1).max(50).optional(),
          apartment: z.string().min(1).max(50).optional(),
          notes: z.string().min(1).max(500).optional(),
          isDefault: z.boolean().default(false),
        }),
      )
      .optional(),
  })
  .strict();

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
