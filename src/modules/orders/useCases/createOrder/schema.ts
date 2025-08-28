import { addressSchema } from "@modules/accounts/useCases/createUser/schemas";
import { z } from "zod";

export const createOrderSchema = z
  .object({
    gasAmount: z
      .number({
        required_error: "A quantidade Gás é obrigatória",
        invalid_type_error: "A quantidade Gás deve ser um número",
      })
      .min(0, { message: "A quantidade Gás deve ser maior ou igual a zero" })
      .optional()
      .transform((val) => val ?? 0),
    waterAmount: z
      .number({
        required_error: "A quantidade Água é obrigatória",
        invalid_type_error: "A quantidade Água deve ser um número",
      })
      .min(0, { message: "A quantidade Água deve ser maior ou igual a zero" })
      .optional()
      .transform((val) => val ?? 0),
    waterWithBottle: z.boolean().optional().default(false),
    gasWithBottle: z.boolean().optional().default(false),
    customAddress: addressSchema.optional(),
  })
  .refine((data) => data.gasAmount > 0 || data.waterAmount > 0, {
    message: "Pelo menos um dos valores (Gás ou Água) deve ser maior que zero",
    path: ["gasAmount", "waterAmount"],
  });
