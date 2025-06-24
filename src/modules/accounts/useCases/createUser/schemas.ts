import { z } from "zod";

const addressSchema = z.object({
  street: z
    .string({
      invalid_type_error: "A rua deve ser uma string",
    })
    .min(1, { message: "A rua não pode ser vazia" })
    .max(150, { message: "A rua é muito extensa" })
    .optional(),
  number: z
    .string({
      invalid_type_error: "O do endereço número deve ser uma string",
    })
    .min(1, { message: "O número não pode ser vazia" })
    .max(10, { message: "O número é muito extensa" })
    .optional(),
  reference: z
    .string({
      required_error: "É obrigatória uma referência",
      invalid_type_error: "A referência deve ser uma string",
    })
    .min(1, { message: "A referência não pode ser vazia" })
    .max(150, { message: "A referência é muito extensa" }),
  local: z
    .string({
      required_error: "Local é obrigatório",
      invalid_type_error: "O local deve ser uma string",
    })
    .min(1, { message: "O local não pode ser vazio" })
    .max(100, { message: "O nome do local é maior que 100 caracteres" }),
});

export const createUserSchema = z.object({
  username: z
    .string({ required_error: "O nome de usuário é obrigatório" })
    .min(3, { message: "O nome de usuário deve ter pelo menos 3 caracteres" }),
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
