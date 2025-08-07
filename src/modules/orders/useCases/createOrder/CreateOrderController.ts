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

      const order = await createOrderUseCase.execute({
        user_id: id,
        gasAmount,
        waterAmount,
        waterWithBottle,
        gasWithBottle,
      });

      if (order) await this.notifyNewOrder(adminUser);

      return response.status(201).json(order);
    } catch (err) {
      return handleControllerError(err, response);
    }
  };

  private async notifyNewOrder(adminUser: IUserResponseDTO) {
    const SendNotification = container.resolve(SendNotificationUseCase);
    const pushTokens = adminUser.notificationTokens;

    try {
      await SendNotification.execute({
        notificationTokens: pushTokens,
        notificationTitle: "Novo pedido",
        notificationBody: "Novo pedido solicitado no app",
      });
    } catch (err) {
      console.log(err);
      throw new Error(err);
    }
  }
}
