import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { OrderProps } from "@modules/orders/types";
import { IStockRepository } from "@modules/stock/repositories/IStockRepository";
import { inject, injectable } from "tsyringe";

export type AdminHomeDashboardData = {
  totalOrdersToday: number;
  waterOrdersToday: number;
  gasOrdersToday: number;
  waterStockQuantity: number;
  gasStockQuantity: number;
  totalRevenueToday: number;
};

@injectable()
export class GetAdminHomeDashboardUseCase {
  constructor(
    @inject("OrdersRepository")
    private ordersRepository: IOrdersRepository,
    @inject("StockRepository")
    private stockRepository: IStockRepository
  ) {}

  async execute(): Promise<AdminHomeDashboardData> {
    const todayOrders = await this.ordersRepository.findByDay(new Date());
    const stockItems = await this.stockRepository.findAll();

    const waterStockItem = stockItems.find((item) => item.type === "WATER");
    const gasStockItem = stockItems.find((item) => item.type === "GAS");

    return {
      totalOrdersToday: todayOrders.length,
      waterOrdersToday: this.countOrdersByProductType(todayOrders, "WATER"),
      gasOrdersToday: this.countOrdersByProductType(todayOrders, "GAS"),
      waterStockQuantity: waterStockItem?.quantity ?? 0,
      gasStockQuantity: gasStockItem?.quantity ?? 0,
      totalRevenueToday: this.calculatePaidRevenueToday(todayOrders),
    };
  }

  private calculatePaidRevenueToday(orders: OrderProps[]): number {
    return orders
      .filter((order) => order.payment_state === "PAGO")
      .reduce(
        (accumulatedTotal, order) => accumulatedTotal + Number(order.total),
        0
      );
  }

  private countOrdersByProductType(
    orders: OrderProps[],
    productType: string
  ): number {
    return orders.filter((order) =>
      order.orderItems?.some(
        (orderItem) => orderItem.stock?.type === productType
      )
    ).length;
  }
}
