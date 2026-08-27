import { z } from "zod";

export const updateSettingsSchema = z
  .object({
    depositPercentage: z.number().min(0).max(100).optional(),
    walletNumber: z.string().trim().optional(),
    vodafoneCashNumber: z.string().trim().optional(),
    whatsappNumber: z.string().trim().optional(),
  })
  .strict();

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
