import { ValidationError } from "class-validator";

import { AppError } from "@shared/errors/AppError";

import { validationExceptionFactory } from "../../filters/validation.exception-factory";

describe("validationExceptionFactory", () => {
  it("concatena mensagens como o validateSchema", () => {
    const errors = [
      {
        constraints: { isString: "O nome deve ser uma string" },
        children: [],
      },
    ] as unknown as ValidationError[];

    const appError = validationExceptionFactory(errors);

    expect(appError).toBeInstanceOf(AppError);
    expect(appError.statusCode).toBe(400);
    expect(appError.message).toBe("O nome deve ser uma string.");
  });
});
