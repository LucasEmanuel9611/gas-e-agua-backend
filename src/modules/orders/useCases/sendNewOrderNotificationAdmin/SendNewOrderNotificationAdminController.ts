import { ListAdminUserUseCase } from "@modules/accounts/useCases/listAdminUser/ListAdminUserUseCase";
import { Request, Response } from "express";
import { container } from "tsyringe";

import { SendNotificationUseCase } from "./SendNewOrderNotificationAdminUseCase";

export class sendNewOrderNotificationAdminController {
  async handle(request: Request, response: Response) {
    const { title, message } = request.body;
    const SendNotification = container.resolve(SendNotificationUseCase);
    const listAdminUserUseCase = container.resolve(ListAdminUserUseCase);
    const user = await listAdminUserUseCase.execute();

    const pushTokens = user.notificationTokens;

    try {
      await SendNotification.execute({
        notificationTokens: pushTokens,
        notificationTitle: title,
        notificationBody: message,
      });
    } catch (err) {
      console.log(err);
      response.status(200).json();
    }

    response.status(200).json();
  }
}
