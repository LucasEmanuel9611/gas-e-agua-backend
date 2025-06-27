import { z } from "zod";

import { stringAsNumberSchema } from "@shared/utils/schema";

export const partialPaymentSchema = z.object({
  order_id: stringAsNumberSchema("ID do pedido"),
  amount_paid: stringAsNumberSchema("Valor do pagamento").refine(
    (val) => val > 0,
    {
      message: "Valor do pagamento deve ser maior que zero",
    }
  ),
  payment_method: z
    .enum(["DINHEIRO", "PIX", "CARTAO", "TRANSFERENCIA"], {
      required_error: "Método de pagamento é obrigatório",
      invalid_type_error: "Método de pagamento inválido",
    })
    .default("DINHEIRO"),
  notes: z.string().optional(),
});
