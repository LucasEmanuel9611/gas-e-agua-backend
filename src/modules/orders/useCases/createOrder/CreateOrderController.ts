import { ListAdminUserUseCase } from "@modules/accounts/useCases/listAdminUser/ListAdminUserUseCase";
import { GetStockUseCase } from "@modules/stock/useCases/getStock/GetStockUseCase";
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

    async function verifyStock() {
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

    try {
      const isAdmin = Number(adminUser.id) === Number(id);

      await verifyStock();

      const order = await createOrderUseCase.execute({
        user_id: id,
        isAdmin,
        gasAmount,
        waterAmount,
      });

      if (order) await notifyNewOrder();
      response.status(201).json(order);
    } catch (err) {
      console.log("teste", { err });
      throw new AppError("Erro ao criar pedido", 500);
    }
  }
}
