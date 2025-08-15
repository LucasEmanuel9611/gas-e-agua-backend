import { z } from "zod";

export const updateUserNotificationTokenSchema = z.object({
  token: z
    .string({
      required_error: "O token de notificação é obrigatório",
      invalid_type_error: "O token deve ser uma string",
    })
    .min(1, { message: "O token não pode ser vazio" })
    .regex(/^ExponentPushToken\[.+\]$/, {
      message: "O token deve ser um token válido do Expo",
    }),
});
