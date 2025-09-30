import { z } from "zod";

const updateAddressSchema = z.object({
  street: z
    .string({
      invalid_type_error: "A rua deve ser uma string",
    })
    .min(1, { message: "A rua não pode ser vazia" })
    .max(150, { message: "A rua é muito extensa" })
    .optional(),
  number: z
    .string({
      invalid_type_error: "O número do endereço deve ser uma string",
    })
    .min(1, { message: "O número não pode ser vazio" })
    .max(10, { message: "O número é muito extenso" })
    .optional(),
  reference: z
    .string({
      invalid_type_error: "A referência deve ser uma string",
    })
    .min(1, { message: "A referência não pode ser vazia" })
    .max(150, { message: "A referência é muito extensa" })
    .optional(),
  local: z
    .string({
      invalid_type_error: "O local deve ser uma string",
    })
    .min(1, { message: "O local não pode ser vazio" })
    .max(100, { message: "O nome do local é maior que 100 caracteres" })
    .optional(),
});

export const updateUserSchema = z
  .object({
    username: z
      .string({ invalid_type_error: "O nome de usuário deve ser uma string" })
      .min(3, { message: "O nome de usuário deve ter pelo menos 3 caracteres" })
      .optional(),
    telephone: z
      .string({
        invalid_type_error: "O número de telefone deve ser uma string",
      })
      .length(11, {
        message: "O número de telefone deve ter exatamente 11 dígitos",
      })
      .optional(),
    address: updateAddressSchema.optional(),
  })
  .strict({
    message:
      "Campos não permitidos para atualização. Apenas username, telephone e endereço podem ser atualizados.",
  });
