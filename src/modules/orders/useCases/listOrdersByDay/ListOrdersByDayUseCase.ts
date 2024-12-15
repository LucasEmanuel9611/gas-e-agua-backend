import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { Order } from "@modules/orders/types";
import dayjs from "dayjs";
import { inject, injectable } from "tsyringe";

@injectable()
export class ListOrdersByDayUseCase {
  constructor(
    @inject("OrdersRepository")
    private ordersRepository: IOrdersRepository
  ) {}

  async execute(date: string): Promise<Order[]> {
    const ordersByDay = await this.ordersRepository.findByDay(
      dayjs(date).toDate()
    );

    return ordersByDay;
  }
}
