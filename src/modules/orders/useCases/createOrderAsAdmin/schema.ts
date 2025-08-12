import { z } from "zod";

export const createOrderAsAdminSchema = z
  .object({
    user_id: z
      .number({
        required_error: "ID do usuário é obrigatório",
        invalid_type_error: "ID do usuário deve ser um número",
      })
      .positive({ message: "ID do usuário deve ser positivo" }),
    gasAmount: z
      .number({
        required_error: "A quantidade Gás é obrigatória",
        invalid_type_error: "A quantidade Gás deve ser um número",
      })
      .min(0, { message: "A quantidade Gás deve ser maior ou igual a zero" }),
    waterAmount: z
      .number({
        required_error: "A quantidade Água é obrigatória",
        invalid_type_error: "A quantidade Água deve ser um número",
      })
      .min(0, { message: "A quantidade Água deve ser maior ou igual a zero" }),
    waterWithBottle: z.boolean().optional().default(false),
    gasWithBottle: z.boolean().optional().default(false),
    status: z
      .enum(["INICIADO", "PENDENTE", "FINALIZADO"])
      .optional()
      .default("PENDENTE"),
    payment_state: z
      .enum(["PENDENTE", "PAGO", "VENCIDO", "PARCIALMENTE_PAGO"])
      .optional()
      .default("PENDENTE"),
    total: z
      .number({
        invalid_type_error: "Total deve ser um número",
      })
      .positive({ message: "Total deve ser positivo" })
      .optional(),
    interest_allowed: z.boolean().optional().default(true),
    overdue_amount: z
      .number({
        invalid_type_error: "Valor do débito passado deve ser um número",
      })
      .min(0, {
        message: "Valor do débito passado deve ser maior ou igual a zero",
      })
      .optional()
      .default(0),
    overdue_description: z.string().optional().default("Débito passado"),
    due_date: z.date().optional(),
  })
  .refine((data) => data.gasAmount > 0 || data.waterAmount > 0, {
    message: "Pelo menos um dos valores (Gás ou Água) deve ser maior que zero",
    path: ["gasAmount", "waterAmount"],
  });
