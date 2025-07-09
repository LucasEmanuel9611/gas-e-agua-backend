import { z } from "zod";

export const editOrderSchema = z.object({
  order_id: z
    .string({ required_error: "O id do pedido é obrigatório" })
    .min(1, "O id do pedido é obrigatório")
    .refine((val) => val.trim().length > 0, {
      message: "O id do pedido é obrigatório",
    }),
  date: z.string({ required_error: "A data é obrigatória" }),
});
