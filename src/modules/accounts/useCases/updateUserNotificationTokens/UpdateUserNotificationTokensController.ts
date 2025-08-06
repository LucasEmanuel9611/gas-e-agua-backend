import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";
import { validateSchema } from "@shared/utils/schema";

import { updateUserNotificationTokenSchema } from "./schema";
import { UpdateUserNotificationTokensUseCase } from "./UpdateUserNotificationTokensUseCase";

export class UpdateUserNotificationTokensController {
  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const { id } = request.user;
      const { token } = validateSchema(
        updateUserNotificationTokenSchema,
        request.body
      );

      const updateUserNotificationTokensUseCase = container.resolve(
        UpdateUserNotificationTokensUseCase
      );

      const user = await updateUserNotificationTokensUseCase.execute(
        Number(id),
        token
      );

      return response.json(user);
    } catch (error) {
      return handleControllerError(error, response);
    }
  }
}
