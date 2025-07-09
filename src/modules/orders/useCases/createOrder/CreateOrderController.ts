import { IUserResponseDTO } from "@modules/accounts/types";
import { ListAdminUserUseCase } from "@modules/accounts/useCases/listAdminUser/ListAdminUserUseCase";
import { GetStockUseCase } from "@modules/stock/useCases/getStock/GetStockUseCase";
import { Request, Response } from "express";
import { container } from "tsyringe";

import { AppError } from "@shared/errors/AppError";
import { handleControllerError } from "@shared/utils/controller";
import { validateSchema } from "@shared/utils/schema";

import { SendNotificationUseCase } from "../sendNewOrderNotificationAdmin/SendNewOrderNotificationAdminUseCase";
import { CreateOrderUseCase } from "./CreateOrderUseCase";
import { createOrderSchema } from "./schema";

export class CreateOrderController {
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

  private async verifyStock(gasAmount: number, waterAmount: number) {
    const getStockItemsUseCase = container.resolve(GetStockUseCase);

    const allStockItems = await getStockItemsUseCase.execute();

    const gasStock = allStockItems.find((item) => item.name === "Gás");
    const waterStock = allStockItems.find((item) => item.name === "Água");

    const isGasInsufficient = gasAmount >= gasStock.quantity;
    const isWaterInsufficient = waterAmount >= waterStock.quantity;

    if (isGasInsufficient && isWaterInsufficient) {
      throw new AppError("Estoque insuficiente de gás e água", 400);
    } else if (isGasInsufficient) {
      throw new AppError("Estoque insuficiente de gás", 400);
    } else if (isWaterInsufficient) {
      throw new AppError("Estoque insuficiente de água", 400);
    }
  }

  handle = async (request: Request, response: Response) => {
    try {
      const { gasAmount, waterAmount } = validateSchema(
        createOrderSchema,
        request.body
      );
      const { id } = request.user;

      const createOrderUseCase = container.resolve(CreateOrderUseCase);
      const listAdminUserUseCase = container.resolve(ListAdminUserUseCase);
      const adminUser = await listAdminUserUseCase.execute();

      await this.verifyStock(gasAmount, waterAmount);

      const order = await createOrderUseCase.execute({
        user_id: id,
        gasAmount,
        waterAmount,
      });

      if (order) await this.notifyNewOrder(adminUser);

      return response.status(201).json(order);
    } catch (err) {
      console.log({ err });
      // TODO: Colocar return no handle e remover o AppError
      return handleControllerError(err, response);
    }
  };
}
