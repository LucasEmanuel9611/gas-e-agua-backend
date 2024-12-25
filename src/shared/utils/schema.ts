import { ZodError, ZodSchema } from "zod";

import { AppError } from "@shared/errors/AppError";

export const validateSchema = <T>(schema: ZodSchema<T>, data: unknown): T => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      console.error(error.errors); // Log detalhado dos erros
      throw new AppError(error.errors[0].message);
    }
    throw error;
  }
};
