import { z } from "zod";

export const editOrderSchema = z.object({
  order_id: z
    .string({ required_error: "O id do pedido é obrigatório" })
    .min(1, "O id do pedido é obrigatório")
    .refine((val) => val.trim().length > 0, {
      message: "O id do pedido é obrigatório",
    }),
  gasAmount: z
    .number({
      invalid_type_error: "A quantidade de gás deve ser um número",
    })
    .min(0, { message: "A quantidade de gás deve ser maior ou igual a zero" })
    .optional(),
  waterAmount: z
    .number({
      invalid_type_error: "A quantidade de água deve ser um número",
    })
    .min(0, { message: "A quantidade de água deve ser maior ou igual a zero" })
    .optional(),
  waterWithBottle: z.boolean().optional(),
  gasWithBottle: z.boolean().optional(),
});
