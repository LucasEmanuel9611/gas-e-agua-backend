import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import dayjs from "dayjs";
import { inject, injectable } from "tsyringe";

@injectable()
export class ListOrdersHoursByDayUseCase {
  constructor(
    @inject("OrdersRepository")
    private ordersRepository: IOrdersRepository
  ) {}

  async execute(date: string): Promise<Date[]> {
    // try {
    const allDayOrders = await this.ordersRepository.findByDay(
      dayjs(date).toDate()
    );

    const filteredValidOrders = allDayOrders.filter(
      (order) => order.status === "PENDENTE"
    );

    const orderHours = filteredValidOrders.map((order) => order.date);

    return orderHours;
    // } catch (e) {
    //   console.log(e);
    // }
  }
}
