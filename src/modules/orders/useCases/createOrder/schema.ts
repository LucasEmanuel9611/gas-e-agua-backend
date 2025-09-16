import { addressSchema } from "@modules/accounts/useCases/createUser/schemas";
import { z } from "zod";

export const createOrderSchema = z.object({
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
    .min(1, { message: "Pelo menos um item é obrigatório" }),
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
  customAddress: addressSchema.optional(),
  // Campos opcionais para admin
  user_id: z
    .number({
      invalid_type_error: "ID do usuário deve ser um número",
    })
    .positive({ message: "ID do usuário deve ser positivo" })
    .optional(),
  status: z.enum(["INICIADO", "PENDENTE", "FINALIZADO"]).optional(),
  payment_state: z
    .enum(["PENDENTE", "PAGO", "VENCIDO", "PARCIALMENTE_PAGO"])
    .optional(),
  total: z
    .number({
      invalid_type_error: "Total deve ser um número",
    })
    .positive({ message: "Total deve ser positivo" })
    .optional(),
  interest_allowed: z.boolean().optional(),
  overdue_amount: z
    .number({
      invalid_type_error: "Valor do débito passado deve ser um número",
    })
    .min(0, {
      message: "Valor do débito passado deve ser maior ou igual a zero",
    })
    .optional(),
  overdue_description: z.string().optional(),
  due_date: z.date().optional(),
});
