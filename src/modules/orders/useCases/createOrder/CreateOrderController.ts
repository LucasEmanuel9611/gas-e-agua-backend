import { IUserResponseDTO } from "@modules/accounts/types";
import { ListAdminUserUseCase } from "@modules/accounts/useCases/listAdminUser/ListAdminUserUseCase";
import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";
import { validateSchema } from "@shared/utils/schema";

import { SendNotificationUseCase } from "../sendNewOrderNotificationAdmin/SendNewOrderNotificationAdminUseCase";
import { CreateOrderUseCase } from "./CreateOrderUseCase";
import { createOrderSchema } from "./schema";

export class CreateOrderController {
  handle = async (request: Request, response: Response) => {
    try {
      const { gasAmount, waterAmount, waterWithBottle, gasWithBottle } =
        validateSchema(createOrderSchema, request.body);
      const { id } = request.user;

      const createOrderUseCase = container.resolve(CreateOrderUseCase);
      const listAdminUserUseCase = container.resolve(ListAdminUserUseCase);
      const adminUser = await listAdminUserUseCase.execute();
      let notificationSent;

      const order = await createOrderUseCase.execute({
        user_id: id,
        gasAmount,
        waterAmount,
        waterWithBottle,
        gasWithBottle,
      });

      if (order) {
        try {
          await this.notifyNewOrder(adminUser);
          notificationSent = true;
        } catch (err) {
          console.error("Falha ao enviar notificação de novo pedido:", err);
          notificationSent = false;
        }
      }

      const notificationMessage = notificationSent
        ? "Pedido criado com sucesso!"
        : "Pedido criado com sucesso, mas houve falha no envio da notificação";

      return response.status(201).json({
        ...order,
        message: notificationMessage,
      });
    } catch (err) {
      return handleControllerError(err, response);
    }
  };

  private async notifyNewOrder(adminUser: IUserResponseDTO) {
    const SendNotification = container.resolve(SendNotificationUseCase);
    const pushTokens = adminUser.notificationTokens;

    await SendNotification.execute({
      notificationTokens: pushTokens,
      notificationTitle: "Novo pedido",
      notificationBody: "Novo pedido solicitado no app",
    });
  }
}
