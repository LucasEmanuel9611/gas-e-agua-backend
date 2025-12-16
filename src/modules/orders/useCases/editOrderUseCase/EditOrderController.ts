import { ListAdminUserUseCase } from "@modules/accounts/useCases/listAdminUser/ListAdminUserUseCase";
import { ExpoPushService } from "@modules/notifications/services/ExpoPushService";
import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";
import { validateSchema } from "@shared/utils/schema";

import { EditOrderUseCase } from "./EditOrderUseCase";
import { editOrderSchema } from "./schema";

export class EditOrderController {
  async handle(request: Request, response: Response) {
    try {
      const { items, addons } = request.body;
      const { id } = request.params;

      const {
        order_id,
        items: validatedItems,
        addons: validatedAddons,
      } = validateSchema(editOrderSchema, {
        order_id: id,
        items,
        addons,
      });

      const editOrderUseCase = container.resolve(EditOrderUseCase);

      const order = await editOrderUseCase.execute({
        order_id,
        items: validatedItems as Array<{
          id: number;
          type: string;
          quantity: number;
        }>,
        addons: validatedAddons as Array<{
          id: number;
          type: string;
          quantity: number;
        }>,
      });

      await this.notifyAdmins(Number(order_id));

      return response.status(200).json(order);
    } catch (error) {
      return handleControllerError(error, response);
    }
  }

  private async notifyAdmins(orderId: number) {
    try {
      const listAdminUserUseCase = container.resolve(ListAdminUserUseCase);
      const expoPushService = container.resolve(ExpoPushService);
      const adminUser = await listAdminUserUseCase.execute();
      const tokens = adminUser.notificationTokens
        .filter((t) => t.is_valid !== false)
        .map((t) => t.token);

      if (tokens.length === 0) return;

      await expoPushService.sendPushNotification({
        to: tokens,
        title: "Pedido editado",
        body: "Um pedido foi editado no app",
        data: { notificationType: "order_edited", orderId },
      });
    } catch (err) {
      console.error("Notificação não enviada:", err);
    }
  }
}
