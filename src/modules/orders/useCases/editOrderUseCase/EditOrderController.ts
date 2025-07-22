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
      const { gasAmount, waterAmount, waterWithBottle, gasWithBottle } =
        request.body;
      const { id } = request.params;

      const {
        order_id,
        gasAmount: validatedGasAmount,
        waterAmount: validatedWaterAmount,
        waterWithBottle: validatedWaterWithBottle,
        gasWithBottle: validatedGasWithBottle,
      } = validateSchema(editOrderSchema, {
        order_id: id,
        gasAmount,
        waterAmount,
        waterWithBottle,
        gasWithBottle,
      });

      const editOrderUseCase = container.resolve(EditOrderUseCase);

      const order = await editOrderUseCase.execute({
        order_id,
        gasAmount: validatedGasAmount,
        waterAmount: validatedWaterAmount,
        waterWithBottle: validatedWaterWithBottle,
        gasWithBottle: validatedGasWithBottle,
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
