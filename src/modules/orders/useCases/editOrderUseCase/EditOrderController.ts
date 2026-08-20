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
      const expoPushService = container.resolve(ExpoPushService);
      await expoPushService.sendPushToAdmins({
        title: "Pedido editado",
        body: "Um pedido foi editado no app",
        data: { notificationType: "order_edited", orderId },
      });
    } catch (err) {
      console.error("Notificação não enviada:", err);
    }
  }
}
