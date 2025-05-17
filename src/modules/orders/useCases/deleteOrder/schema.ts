import { z } from "zod";

export const deleteOrderSchema = z.object({
  id: z.string({
    invalid_type_error: "O id deve ser uma string",
    required_error: "O id é obrigatório",
  }),
});
