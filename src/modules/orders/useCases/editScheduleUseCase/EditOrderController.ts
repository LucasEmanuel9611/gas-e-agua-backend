import { ListAdminUserUseCase } from "@modules/accounts/useCases/listAdminUser/ListAdminUserUseCase";
import { Request, Response } from "express";
import { container } from "tsyringe";

import { SendNotificationUseCase } from "../sendNewOrderNotificationAdmin/SendNewOrderNotificationAdminUseCase";
import { EditOrderUseCase } from "./EditOrderUseCase";

export class EditOrderController {
  async handle(request: Request, response: Response) {
    const { date } = request.body;
    const { id } = request.params;

    const editOrderUseCase = container.resolve(EditOrderUseCase);
    const SendNotification = container.resolve(SendNotificationUseCase);
    const listAdminUserUseCase = container.resolve(ListAdminUserUseCase);
    const user = await listAdminUserUseCase.execute();

    const order = await editOrderUseCase.execute({
      order_id: id,
      date,
    });

    if (order) {
      const pushTokens = user.notificationTokens;

      try {
        await SendNotification.execute({
          notificationTokens: pushTokens,
          notificationTitle: "Edição no agendamento",
          notificationBody: "Edição de agendamento solicitada no app",
        });
      } catch (err) {
        console.log(err);
        throw new Error(err);
      }
    }

    response.status(201).json(order);
  }
}
