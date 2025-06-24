import { z } from "zod";

export const authenticateUserSchema = z.object({
  email: z
    .string({ required_error: "O e-mail é obrigatório" })
    .email({ message: "O e-mail fornecido é inválido" }),
  password: z
    .string({ required_error: "A senha é obrigatória" })
    .min(6, { message: "A senha deve ter pelo menos 6 dígitos" }),
});
