import { z } from "zod";

export const createStockItemSchema = z.object({
  quantity: z
    .number({
      required_error: "A quantidade é obrigatória",
      invalid_type_error: "A quantidade deve ser um número",
    })
    .min(0, { message: "A quantidade deve ser maior que 0" }),
  name: z
    .string({
      required_error: "O nome é obrigatório",
      invalid_type_error: "O nome deve ser uma string",
    })
    .min(2, { message: "O nome não pode ser vazio" }),
  value: z
    .number({
      required_error: "O valor é obrigatório",
      invalid_type_error: "O valor deve ser um número",
    })
    .min(0, { message: "O valor deve ser maior que 0" }),
});

export const updateStockItemSchema = z.object({
  quantity: z
    .number({
      invalid_type_error: "A quantidade deve ser um número",
    })
    .min(0, { message: "A quantidade deve ser maior ou igual a 0" })
    .optional(),
  name: z
    .string({
      invalid_type_error: "O nome deve ser uma string",
    })
    .min(2, { message: "O nome não pode ser vazio" })
    .optional(),
  value: z
    .number({
      invalid_type_error: "O valor deve ser um número",
    })
    .min(1, { message: "O valor deve ser maior que 0" })
    .optional(),
});
