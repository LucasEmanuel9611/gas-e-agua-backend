import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { OrderProps } from "@modules/orders/types";
import { Inject, Injectable } from "@nestjs/common";

export type DeliveryDaySummaryData = {
  totalOrdersToday: number;
  pendingCount: number;
  inProgressCount: number;
  completedCount: number;
};

@Injectable()
export class GetDeliveryDaySummaryUseCase {
  constructor(
    @Inject("OrdersRepository")
    private ordersRepository: IOrdersRepository
  ) {}

  async execute(): Promise<DeliveryDaySummaryData> {
    const todayOrders = await this.ordersRepository.findByDay(new Date());

    return {
      totalOrdersToday: todayOrders.length,
      pendingCount: this.countByStatus(todayOrders, "PENDENTE"),
      inProgressCount: this.countByStatus(todayOrders, "INICIADO"),
      completedCount: this.countByStatus(todayOrders, "FINALIZADO"),
    };
  }

  private countByStatus(orders: OrderProps[], status: string): number {
    return orders.filter((order) => order.status === status).length;
  }
}
