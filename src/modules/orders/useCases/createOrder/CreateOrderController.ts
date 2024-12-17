import { ListAdminUserUseCase } from "@modules/accounts/useCases/listAdminUser/ListAdminUserUseCase";
import { Request, Response } from "express";
import { container } from "tsyringe";

import { AppError } from "@shared/errors/AppError";

import { SendNotificationUseCase } from "../sendNewOrderNotificationAdmin/SendNewOrderNotificationAdminUseCase";
import { CreateOrderUseCase } from "./CreateOrderUseCase";

export class CreateOrderController {
  async handle(request: Request, response: Response) {
    const { gasAmount, waterAmount } = request.body;
    const { id } = request.user;

    const createOrderUseCase = container.resolve(CreateOrderUseCase);
    const SendNotification = container.resolve(SendNotificationUseCase);
    const listAdminUserUseCase = container.resolve(ListAdminUserUseCase);
    const adminUser = await listAdminUserUseCase.execute();

    async function notifyNewOrder() {
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

    try {
      const isAdmin = Number(adminUser.id) === Number(id);

      const order = await createOrderUseCase.execute({
        user_id: id,
        isAdmin,
        gasAmount,
        waterAmount,
      });

      if (order) notifyNewOrder();
      response.status(201).json(order);
    } catch (err) {
      console.log({ err });
      throw new AppError("Erro ao criar pedido", 500);
    }
  }
}
