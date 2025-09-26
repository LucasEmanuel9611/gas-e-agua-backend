import { z } from "zod";

export const editOrderSchema = z.object({
  order_id: z
    .string({ required_error: "O id do pedido é obrigatório" })
    .min(1, "O id do pedido é obrigatório")
    .refine((val) => val.trim().length > 0, {
      message: "O id do pedido é obrigatório",
    }),
  items: z
    .array(
      z.object({
        id: z.number({
          required_error: "ID do produto é obrigatório",
          invalid_type_error: "ID deve ser um número",
        }),
        type: z
          .string({
            required_error: "Tipo do produto é obrigatório",
            invalid_type_error: "Tipo deve ser uma string",
          })
          .min(1, "Tipo não pode ser vazio"),
        quantity: z
          .number({
            required_error: "Quantidade é obrigatória",
            invalid_type_error: "Quantidade deve ser um número",
          })
          .min(1, { message: "Quantidade deve ser maior que zero" }),
      })
    )
    .optional()
    .default([]),
  addons: z
    .array(
      z.object({
        id: z.number({
          required_error: "ID do addon é obrigatório",
          invalid_type_error: "ID deve ser um número",
        }),
        type: z
          .string({
            required_error: "Tipo do addon é obrigatório",
            invalid_type_error: "Tipo deve ser uma string",
          })
          .min(1, "Tipo não pode ser vazio"),
        quantity: z
          .number({
            required_error: "Quantidade é obrigatória",
            invalid_type_error: "Quantidade deve ser um número",
          })
          .min(1, { message: "Quantidade deve ser maior que zero" }),
      })
    )
    .optional()
    .default([]),
});
