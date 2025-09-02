import { ListAdminUserUseCase } from "@modules/accounts/useCases/listAdminUser/ListAdminUserUseCase";
import { AdminFieldPolicy } from "@modules/orders/policies/AdminFieldPolicy";
import { IOrderCreationData } from "@modules/orders/services/IOrderCreationService";
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
      const orderData = validateSchema(
        createOrderSchema,
        request.body
      ) as IOrderCreationData;

      const { id, role } = request.user;
      const isAdmin = role === "ADMIN";

      const createOrderUseCase = container.resolve(CreateOrderUseCase);

      const userIdProvidedByAdmin = orderData.user_id;
      const targetUserId = isAdmin ? userIdProvidedByAdmin : id;

      AdminFieldPolicy.validate(role, orderData);

      const order = await createOrderUseCase.execute({
        ...orderData,
        user_id: Number(targetUserId),
      });

      const { sent: notificationSent } = await this.notifyAdminNewOrder(
        isAdmin,
        order
      );

      const notificationMessage = notificationSent
        ? "Pedido criado com sucesso!"
        : "Pedido criado com sucesso, notificação não enviada";

      return response.status(201).json({
        ...order,
        message: notificationMessage,
      });
    } catch (err) {
      return handleControllerError(err, response);
    }
  };

  private async notifyAdminNewOrder(isAdmin: boolean, order: any) {
    const shouldNotifyAdmins = order && !isAdmin;

    if (shouldNotifyAdmins) {
      try {
        const SendNotification = container.resolve(SendNotificationUseCase);
        const listAdminUserUseCase = container.resolve(ListAdminUserUseCase);
        const adminUser = await listAdminUserUseCase.execute();
        const pushTokens = adminUser.notificationTokens;

        await SendNotification.execute({
          notificationTokens: pushTokens,
          notificationTitle: "Novo pedido",
          notificationBody: "Novo pedido solicitado no app",
        });
        return { sent: true };
      } catch (err) {
        console.error("Notificação não enviada:", err);
        return { sent: false };
      }
    }
    return { sent: false };
  }
}
