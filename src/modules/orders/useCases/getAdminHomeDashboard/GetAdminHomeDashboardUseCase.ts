import dayjs from "@config/dayjs.config";
import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { OrderProps } from "@modules/orders/types";
import { IStockRepository } from "@modules/stock/repositories/IStockRepository";
import { ITransactionsRepository } from "@modules/transactions/repositories/ITransactionsRepository";
import { inject, injectable } from "tsyringe";

const BUSINESS_TIMEZONE = "America/Recife";

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
    private stockRepository: IStockRepository,
    @inject("TransactionsRepository")
    private transactionsRepository: ITransactionsRepository
  ) {}

  async execute(): Promise<AdminHomeDashboardData> {
    const todayInBusinessTimezone = dayjs().tz(BUSINESS_TIMEZONE);
    const startOfToday = todayInBusinessTimezone
      .clone()
      .startOf("day")
      .toDate();
    const endOfTodayExclusive = todayInBusinessTimezone
      .clone()
      .endOf("day")
      .add(1, "millisecond")
      .toDate();

    const [todayOrders, stockItems, totalRevenueToday] = await Promise.all([
      this.ordersRepository.findByDay(new Date()),
      this.stockRepository.findAll(),
      this.transactionsRepository.sumPaymentsByDateRange(
        startOfToday,
        endOfTodayExclusive
      ),
    ]);

    const waterStockItem = stockItems.find((item) => item.type === "WATER");
    const gasStockItem = stockItems.find((item) => item.type === "GAS");

    return {
      totalOrdersToday: todayOrders.length,
      waterOrdersToday: this.countOrdersByProductType(todayOrders, "WATER"),
      gasOrdersToday: this.countOrdersByProductType(todayOrders, "GAS"),
      waterStockQuantity: waterStockItem?.quantity ?? 0,
      gasStockQuantity: gasStockItem?.quantity ?? 0,
      totalRevenueToday,
    };
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
