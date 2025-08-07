import { ListAdminUserUseCase } from "@modules/accounts/useCases/listAdminUser/ListAdminUserUseCase";
import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";
import { validateSchema } from "@shared/utils/schema";

import { sendNotificationSchema } from "./schema";
import { SendNotificationUseCase } from "./SendNewOrderNotificationAdminUseCase";

export class SendNewOrderNotificationAdminController {
  async handle(request: Request, response: Response) {
    try {
      const { title, message } = validateSchema(
        sendNotificationSchema,
        request.body
      );

      const SendNotification = container.resolve(SendNotificationUseCase);
      const listAdminUserUseCase = container.resolve(ListAdminUserUseCase);
      const user = await listAdminUserUseCase.execute();

      const pushTokens = user.notificationTokens;

      await SendNotification.execute({
        notificationTokens: pushTokens,
        notificationTitle: title,
        notificationBody: message,
      });

      return response.status(200).json();
    } catch (error) {
      return handleControllerError(error, response);
    }
  }
}
