import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { OrderProps } from "@modules/orders/types";
import { Inject, Injectable } from "@nestjs/common";
import dayjs from "dayjs";

@Injectable()
export class ListOrdersByDayUseCase {
  constructor(
    @Inject("OrdersRepository")
    private ordersRepository: IOrdersRepository
  ) {}

  async execute(date: string): Promise<OrderProps[]> {
    const ordersByDay = await this.ordersRepository.findByDay(
      dayjs(date).toDate()
    );

    return ordersByDay;
  }
}
