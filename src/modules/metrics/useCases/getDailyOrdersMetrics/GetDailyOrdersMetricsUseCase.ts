import dayjs from "@config/dayjs.config";
import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { Inject, Injectable } from "@nestjs/common";

import { IDailyOrdersMetrics } from "../../types";

@Injectable()
export class GetDailyOrdersMetricsUseCase {
  constructor(
    @Inject("OrdersRepository")
    private ordersRepository: IOrdersRepository
  ) {}

  async execute(date?: string): Promise<IDailyOrdersMetrics> {
    const targetDate = date ? dayjs(date).toDate() : dayjs().toDate();
    const orders = await this.ordersRepository.findByDay(targetDate);

    const itemsByType: { [type: string]: number } = {};
    let totalRevenue = 0;

    orders.forEach((order) => {
      totalRevenue += order.total || 0;

      if (order.orderItems) {
        order.orderItems.forEach((item) => {
          if (item.stock?.type) {
            const { type } = item.stock;
            itemsByType[type] = (itemsByType[type] || 0) + item.quantity;
          }
        });
      }
    });

    return {
      date: dayjs(targetDate).format("YYYY-MM-DD"),
      ordersCount: orders.length,
      totalRevenue,
      itemsByType,
    };
  }
}
