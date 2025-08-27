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
  })
  .refine((data) => data.gasAmount > 0 || data.waterAmount > 0, {
    message: "Pelo menos um dos valores (Gás ou Água) deve ser maior que zero",
    path: ["gasAmount", "waterAmount"],
  });
