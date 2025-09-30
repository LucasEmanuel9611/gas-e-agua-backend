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

      await this.notifyAdmins();

      return response.status(200).json(order);
    } catch (error) {
      return handleControllerError(error, response);
    }
  }

  private async notifyAdmins() {
    const listAdminUserUseCase = container.resolve(ListAdminUserUseCase);
    const adminUser = await listAdminUserUseCase.execute();
    const sendNotificationUseCase = container.resolve(SendNotificationUseCase);
    await sendNotificationUseCase.execute({
      notificationTokens: adminUser.notificationTokens,
      notificationTitle: "Pedido editado",
      notificationBody: "Um pedido foi editado no app",
    });
  }
}
