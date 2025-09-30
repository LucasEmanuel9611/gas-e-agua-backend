import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";
import { validateSchema } from "@shared/utils/schema";

import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { authenticateUserSchema } from "./schemas";

export class AuthenticateUserController {
  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const { email, password } = validateSchema(
        authenticateUserSchema,
        request.body
      );

      const authenticateUserUseCase = container.resolve(
        AuthenticateUserUseCase
      );
      const token = await authenticateUserUseCase.execute({ email, password });

      return response.json(token);
    } catch (error) {
      return handleControllerError(error, response);
    }
  }
}
