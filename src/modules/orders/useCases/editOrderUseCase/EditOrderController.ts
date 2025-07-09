import { ListAdminUserUseCase } from "@modules/accounts/useCases/listAdminUser/ListAdminUserUseCase";
import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";
import { validateSchema } from "@shared/utils/schema";

import { SendNotificationUseCase } from "../sendNewOrderNotificationAdmin/SendNewOrderNotificationAdminUseCase";
import { EditOrderUseCase } from "./EditOrderUseCase";
import { editOrderSchema } from "./schema";

export class EditOrderController {
  async handle(request: Request, response: Response) {
    try {
      const { date } = request.body;
      const { id } = request.params;

      const { order_id, date: validatedDate } = validateSchema(
        editOrderSchema,
        {
          order_id: id,
          date,
        }
      );

      const editOrderUseCase = container.resolve(EditOrderUseCase);
      const SendNotification = container.resolve(SendNotificationUseCase);
      const listAdminUserUseCase = container.resolve(ListAdminUserUseCase);
      const user = await listAdminUserUseCase.execute();

      const order = await editOrderUseCase.execute({
        order_id,
        date: validatedDate,
      });

      if (order) {
        const pushTokens = user.notificationTokens;

        await SendNotification.execute({
          notificationTokens: pushTokens,
          notificationTitle: "Edição no agendamento",
          notificationBody: "Edição de agendamento solicitada no app",
        });
      }

      return response.status(201).json(order);
    } catch (error) {
      return handleControllerError(error, response);
    }
  }
}
