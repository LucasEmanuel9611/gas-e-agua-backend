import { ZodType, z } from "zod";

import { AppError } from "@shared/errors/AppError";

/**
 * Valida dados com um schema Zod de forma segura e retorna os dados validados e transformados.
 *
 * - Usa `schema.safeParse` para evitar exceções automáticas.
 * - Em caso de erro, lança explicitamente um `AppError` com mensagem amigável.
 * - Suporta schemas com transformações (`.transform()`), refinamentos, etc.
 *
 * @param schema - O schema Zod que será usado para validar os dados.
 * @param data - Os dados a serem validados (geralmente vindo de request params, body, etc).
 * @returns Os dados validados e possivelmente transformados, com tipo inferido de `z.infer<T>`.
 *
 * @throws {AppError} Se a validação falhar, com mensagem concatenada das falhas.
 *
 * @example
 * const schema = z.object({ id: z.string().transform(Number) });
 * const result = validateSchema(schema, { id: "42" }); // result.id === 42 (number)
 */
export function validateSchema<T extends ZodType<any, any, any>>(
  schema: T,
  data: unknown
): z.infer<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    const messages = result.error.errors.map((error) => error.message);

    const concatenatedMessages = `${messages.join(". ")}.`;

    const debugMessages = result.error.errors
      .map((error) => `${error.path.join(".")}: ${error.message}`)
      .join("; ");
    console.error(`Validation failed: ${debugMessages}`);

    throw new AppError(concatenatedMessages, 400);
  }

  return result.data;
}

/**
 * Cria um schema Zod que valida se uma string representa um número e a transforma em número.
 *
 * - Garante que o valor seja uma string numérica
 * - Exibe mensagens de erro personalizadas com base no nome do campo fornecido
 * - Transforma a string em um número (usando `Number`)
 *
 * @param fieldName - Nome do campo para aparecer nas mensagens de erro.
 * @returns Um schema Zod que valida strings numéricas e as transforma em `number`.
 *
 * @example
 * const schema = stringAsNumberSchema("Id do pedido");
 * const parsed = schema.parse("123"); // retorna 123 como número
 */
export const stringAsNumberSchema = (fieldName: string) =>
  z
    .string({
      invalid_type_error: `${fieldName} deve ser uma string`,
      required_error: `${fieldName} é obrigatório`,
    })
    .refine((val) => /^\d+$/.test(val), {
      message: `${fieldName} deve ser um número válido`,
    })
    .transform(Number);
