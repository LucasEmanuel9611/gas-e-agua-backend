import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";
import { validateSchema } from "@shared/utils/schema";

import { updateUserNotificationTokenSchema } from "../updateUserNotificationTokens/schema";
import { DeleteUserNotificationTokenUseCase } from "./DeleteUserNotificationTokenUseCase";

export class DeleteUserNotificationTokenController {
  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const { id } = request.user;
      const { token } = validateSchema(
        updateUserNotificationTokenSchema,
        request.body
      );

      const deleteUserNotificationTokenUseCase = container.resolve(
        DeleteUserNotificationTokenUseCase
      );

      await deleteUserNotificationTokenUseCase.execute(Number(id), token);

      return response.status(204).send();
    } catch (error) {
      return handleControllerError(error, response);
    }
  }
}
