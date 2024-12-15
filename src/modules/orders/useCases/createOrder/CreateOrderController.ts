import { ListAdminUserUseCase } from "@modules/accounts/useCases/listAdminUser/ListAdminUserUseCase";
import { ProfileUserUseCase } from "@modules/accounts/useCases/profileUserUseCase/ProfileUserUsecase";
import { Request, Response } from "express";
import { container } from "tsyringe";

import { SendNotificationUseCase } from "../sendNewOrderNotificationAdmin/SendNewOrderNotificationAdminUseCase";
import { CreateOrderUseCase } from "./CreateOrderUseCase";

export class CreateOrderController {
  async handle(request: Request, response: Response) {
    const { date, total } = request.body;
    const { id } = request.user;

    const createOrderUseCase = container.resolve(CreateOrderUseCase);
    const profileUserUseCase = container.resolve(ProfileUserUseCase);
    const SendNotification = container.resolve(SendNotificationUseCase);
    const listAdminUserUseCase = container.resolve(ListAdminUserUseCase);
    const AdminUser = await listAdminUserUseCase.execute();
    const profileUser = await profileUserUseCase.execute(Number(id));

    const isAdmin = Number(AdminUser.id) === Number(id);

    const order = await createOrderUseCase.execute({
      date,
      user_id: id,
      isAdmin,
      total,
    });

    if (order) {
      const pushTokens = profileUser.notificationTokens;

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

    response.status(201).json(order);
  }
}
