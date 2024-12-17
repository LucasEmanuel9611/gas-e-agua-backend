/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { Order } from "@modules/orders/types";
import { inject, injectable } from "tsyringe";

import { IDateProvider } from "@shared/containers/DateProvider/IDateProvider";
import { AppError } from "@shared/errors/AppError";

interface IRequest {
  user_id: string;
  isAdmin: boolean;
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
    @inject("DayjsDateProvider")
    private dateProvider: IDateProvider
  ) {}

  async execute({ user_id, gasAmount, waterAmount }: IRequest): Promise<Order> {
    const { username, address } = await this.usersRepository.findById(
      Number(user_id)
    );

    if (!address) {
      throw new AppError("Usuário sem endereço cadastrado");
    }

    function getProductsValueUseCase() {
      return { waterValue: 6, gasValue: 100 };
    }

    const { waterValue, gasValue } = getProductsValueUseCase();

    const waterTotalValue = Number(waterAmount) * waterValue;
    const gasTotalValue = Number(gasAmount) * gasValue;

    const total = waterTotalValue + gasTotalValue;

    const order = await this.ordersRepository.create({
      username,
      status: "PENDENTE",
      user_id: Number(user_id),
      address_id: address.id,
      gasAmount,
      waterAmount,
      total,
    });

    return order;
  }
}
