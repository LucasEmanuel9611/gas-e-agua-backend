import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";

import { ListUserNotificationTokensUseCase } from "./ListUserNotificationTokensUseCase";

export class ListUserNotificationController {
  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const { id } = request.user;

      const listUserNotificationTokensUseCase = container.resolve(
        ListUserNotificationTokensUseCase
      );

      const user = await listUserNotificationTokensUseCase.execute(Number(id));

      return response.json(user);
    } catch (error) {
      return handleControllerError(error, response);
    }
  }
}
