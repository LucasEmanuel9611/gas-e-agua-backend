import { z } from "zod";

export const updateAddonSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").optional(),
  value: z.number().positive("Valor deve ser positivo").optional(),
  type: z
    .string({
      invalid_type_error: "O tipo deve ser uma string",
    })
    .min(1, { message: "O tipo não pode ser vazio" })
    .optional(),
});
