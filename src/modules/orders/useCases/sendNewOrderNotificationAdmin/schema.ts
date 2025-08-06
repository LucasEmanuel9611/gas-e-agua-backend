import { z } from "zod";

export const sendNotificationSchema = z.object({
  title: z
    .string({
      required_error: "O título da notificação é obrigatório",
      invalid_type_error: "O título deve ser uma string",
    })
    .min(1, { message: "O título não pode ser vazio" })
    .max(100, { message: "O título deve ter no máximo 100 caracteres" }),
  message: z
    .string({
      required_error: "A mensagem da notificação é obrigatória",
      invalid_type_error: "A mensagem deve ser uma string",
    })
    .min(1, { message: "A mensagem não pode ser vazia" })
    .max(500, { message: "A mensagem deve ter no máximo 500 caracteres" }),
});
