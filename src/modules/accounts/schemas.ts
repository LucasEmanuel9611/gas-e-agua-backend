import { z } from "zod";

const addressSchema = z
  .object({
    street: z.string().nullable(),
    reference: z
      .string({ required_error: "É obrigatória uma referência" })
      .max(150, { message: "A referência é muito extensa" })
      .nonempty(),
    local: z
      .string({ required_error: "Local é obrigatório" })
      .max(100, { message: "O nome do local é maior que 100 caracteres" }),
    number: z.string().nullable(),
  })
  .strict();

export const createUserSchema = z.object({
  username: z
    .string({ required_error: "O nome de usuário é obrigatório" })
    .min(3, {
      message: "O nome de usuário deve ter pelo menos 3 caracteres",
    }),
  email: z
    .string({ required_error: "O e-mail é obrigatório" })
    .email({ message: "O e-mail fornecido é inválido" }),
  password: z
    .string({ required_error: "A senha é obrigatória" })
    .min(6, { message: "A senha deve ter pelo menos 6 dígitos" }),
  telephone: z
    .string({ required_error: "O número de telefone é obrigatório" })
    .length(11, {
      message: "O número de telefone deve ter exatamente 11 dígitos",
    }),
  address: addressSchema,
});
