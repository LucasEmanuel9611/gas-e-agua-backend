import { z } from "zod";

export const updatePaymentSettingsSchema = z.object({
  pix_key: z
    .string({
      required_error: "A chave Pix é obrigatória",
      invalid_type_error: "A chave Pix deve ser uma string",
    })
    .min(1, { message: "A chave Pix não pode ser vazia" }),
  recipient_name: z
    .string({
      required_error: "O nome do recebedor é obrigatório",
      invalid_type_error: "O nome do recebedor deve ser uma string",
    })
    .min(2, { message: "O nome do recebedor não pode ser vazio" }),
});
