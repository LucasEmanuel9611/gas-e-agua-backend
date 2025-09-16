import { z } from "zod";

export const createAddonSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  value: z.number().positive("Valor deve ser positivo"),
  type: z
    .string({
      required_error: "O tipo é obrigatório",
      invalid_type_error: "O tipo deve ser uma string",
    })
    .min(1, { message: "O tipo não pode ser vazio" }),
});
