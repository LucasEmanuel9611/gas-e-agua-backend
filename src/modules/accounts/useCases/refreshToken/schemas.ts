import { z } from "zod";

export const refreshTokenSchema = z.object({
  refreshToken: z
    .string({
      required_error: "Refresh token é obrigatório",
      invalid_type_error: "Refresh token deve ser uma string",
    })
    .min(1, { message: "Refresh token não pode ser vazio" }),
});
