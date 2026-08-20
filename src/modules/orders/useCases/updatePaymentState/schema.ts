import { z } from "zod";

export const updatePaymentStateSchema = z.object({
  order_id: z.string({
    required_error: "O ID do pedido é obrigatório",
  }),
  payment_state: z.union(
    [z.literal("PAGO"), z.literal("PENDENTE"), z.literal("PARCIALMENTE_PAGO")],
    {
      errorMap: () => ({
        message:
          "Status de pagamento inválido. Use PAGO, PENDENTE ou PARCIALMENTE_PAGO",
      }),
    }
  ),
  remaining_balance: z.number().positive().optional(),
  notes: z.string().trim().optional(),
});
