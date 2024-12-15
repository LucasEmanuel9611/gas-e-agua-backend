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
  date: Date;
  isAdmin: boolean;
  total: number;
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

  async execute({ user_id, date, isAdmin, total }: IRequest): Promise<Order> {
    const dateNow = this.dateProvider.dateNow();

    const dateIfBeforeNow = this.dateProvider.compareIfBefore(dateNow, date);

    if (!dateIfBeforeNow) {
      throw new AppError("A data tem que ser a superior a atual");
    }

    const allOrders = await this.ordersRepository.findAll();

    const usersOrders = await this.ordersRepository.findByUser(user_id);

    if (!isAdmin) {
      const AlreadyExistsOrderInDay = usersOrders.some((order) => {
        return this.dateProvider.compareIfEqualDay(order.date, date);
      });

      if (AlreadyExistsOrderInDay) {
        throw new AppError("Você já tem um agendamento para hoje");
      }

      const AlreadyExistsInThirtyMinutes = allOrders.some((order) => {
        if (this.dateProvider.isSameDay(date, order.date)) {
          const validOrderDate =
            !this.dateProvider.dateIfDateIsThirtyMinutesAfter(order.date, date);
          return validOrderDate;
        }
      });

      if (AlreadyExistsInThirtyMinutes) {
        throw new AppError("Já existe um agendamento em menos de 30min");
      }
    }

    const { username, address } = await this.usersRepository.findById(
      Number(user_id)
    );

    const order = await this.ordersRepository.create({
      username,
      status: "PENDENTE",
      user_id: Number(user_id),
      date,
      address_id: address.id,
      total,
    });

    return order;
  }
}
