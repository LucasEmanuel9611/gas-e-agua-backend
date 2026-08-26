import { ValidationError } from "class-validator";

import { AppError } from "@shared/errors/AppError";

function collectMessages(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => {
    const current = error.constraints ? Object.values(error.constraints) : [];
    const nested = error.children?.length
      ? collectMessages(error.children)
      : [];
    return [...current, ...nested];
  });
}

export function validationExceptionFactory(
  errors: ValidationError[]
): AppError {
  const messages = collectMessages(errors);
  const concatenatedMessages = `${messages.join(". ")}.`;

  return new AppError({ message: concatenatedMessages, statusCode: 400 });
}
