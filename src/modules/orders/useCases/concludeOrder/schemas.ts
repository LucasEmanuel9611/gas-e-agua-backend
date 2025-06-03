import { OrderStatusProps } from "@modules/orders/types";
import { z } from "zod";

export const concludeOrderSchema = z.object({
  order_id: z.string({
    required_error: "O ID do pedido é obrigatório",
  }),
  status: z.union(
    [z.literal("FINALIZADO"), z.literal("CANCELADO"), z.literal("PENDENTE")],
    {
      errorMap: (issue) => {
        if (issue.code === "invalid_type") {
          return { message: "O status é obrigatório" };
        }
        return { message: "Status inválido" };
      },
    }
  ) as z.ZodType<OrderStatusProps>,
});
