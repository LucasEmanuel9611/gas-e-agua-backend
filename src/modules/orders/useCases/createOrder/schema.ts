import { z } from "zod";

export const createOrderSchema = z.object({
  gasAmount: z
    .number({
      required_error: "A quantidade Gás é obrigatória",
      invalid_type_error: "A quantidade Gás deve ser um número",
    })
    .min(1, { message: "A quantidade Gás deve ser maior que zero" }),

  waterAmount: z
    .number({
      required_error: "A quantidade Água é obrigatória",
      invalid_type_error: "A quantidade Água deve ser um número",
    })
    .min(1, { message: "A quantidade Água deve ser maior que zero" }),
  waterWithBottle: z.boolean().optional().default(false),
  gasWithBottle: z.boolean().optional().default(false),
});
