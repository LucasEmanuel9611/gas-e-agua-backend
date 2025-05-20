import { z } from "zod";

export const createOrderSchema = z.object({
  gasAmount: z
    .string({
      invalid_type_error: `A quantidade Gás deve ser um número`,
      required_error: `A quantidade Gás é obrigatória`,
    })
    .transform(Number),

  waterAmount: z
    .string({
      invalid_type_error: `A quantidade Água deve ser um número`,
      required_error: `A quantidade Água é obrigatória`,
    })
    .transform(Number),
});
