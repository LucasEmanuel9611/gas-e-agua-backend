import { z } from "zod";

export const partialPaymentSchema = z.object({
  order_id: z.number({
    required_error: "O valor da transação é obrigatório",
    invalid_type_error: "A valor da transação deve ser um número",
  }),
  amount_paid: z
    .number({
      required_error: "O valor da transação é obrigatório",
      invalid_type_error: "A valor da transação deve ser um número",
    })
    .min(1, { message: "A valor da transação deve ser maior que zero" }),
  payment_method: z.enum(["DINHEIRO", "PIX", "CARTAO", "TRANSFERENCIA"], {
    required_error: "Método de pagamento é obrigatório",
    invalid_type_error: "Método de pagamento inválido",
  }),
  notes: z.string().optional(),
});
