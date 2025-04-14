/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { Order } from "@modules/orders/types";
import { IStockRepository } from "@modules/stock/repositories/IStockRepository";
import { inject, injectable } from "tsyringe";

import { AppError } from "@shared/errors/AppError";

interface IRequest {
  user_id: string;
  isAdmin: boolean;
  gasAmount: number;
  waterAmount: number;
}

interface IUpdateQuantityStockItemsProps {
  gasAmount: number;
  waterAmount: number;
}

@injectable()
export class CreateOrderUseCase {
  constructor(
    @inject("OrdersRepository")
    private ordersRepository: IOrdersRepository,
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
    @inject("StockRepository")
    private stockRepository: IStockRepository // @inject("DayjsDateProvider") // private dateProvider: IDateProvider
  ) {}

  private async updateQuantityStockItems({
    gasAmount,
    waterAmount,
  }: IUpdateQuantityStockItemsProps) {
    const stockItems = await this.stockRepository.findAll();

    const waterItem = stockItems.find((item) => item.name === "Água");
    const gasItem = stockItems.find((item) => item.name === "Gás");

    if (waterItem) {
      await this.stockRepository.update({
        id: waterItem.id,
        newData: {
          quantity: waterItem.quantity - waterAmount,
        },
      });
    }

    if (gasItem) {
      await this.stockRepository.update({
        id: gasItem.id,
        newData: {
          quantity: gasItem.quantity - gasAmount,
        },
      });
    }
  }

  async execute({ user_id, gasAmount, waterAmount }: IRequest): Promise<Order> {
    const { address } = await this.usersRepository.findById(Number(user_id));

    if (!address) {
      throw new AppError("Usuário sem endereço cadastrado");
    }

    const getProductsValueUseCase = async () => {
      const stockItems = await this.stockRepository.findAll();

      const waterItem = stockItems.find((item) => item.name === "Água");
      const gasItem = stockItems.find((item) => item.name === "Gás");

      return { waterValue: waterItem.quantity, gasValue: gasItem.quantity };
    };

    const { waterValue, gasValue } = await getProductsValueUseCase();

    const waterTotalValue = Number(waterAmount) * waterValue;
    const gasTotalValue = Number(gasAmount) * gasValue;

    const total = waterTotalValue + gasTotalValue;

    await this.updateQuantityStockItems({
      gasAmount: waterAmount,
      waterAmount,
    });

    const order = await this.ordersRepository.create({
      status: "PENDENTE",
      payment_status: "PENDENTE",
      user_id: Number(user_id),
      address_id: address.id,
      gasAmount,
      waterAmount,
      total,
    });

    return order;
  }
}
