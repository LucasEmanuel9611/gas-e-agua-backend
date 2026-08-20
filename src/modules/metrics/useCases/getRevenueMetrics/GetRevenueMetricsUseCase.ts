import dayjs from "@config/dayjs.config";
import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { ITransactionsRepository } from "@modules/transactions/repositories/ITransactionsRepository";
import { inject, injectable } from "tsyringe";

import { AppError } from "@shared/errors/AppError";

import { IRevenueMetrics } from "../../types";

@injectable()
export class GetRevenueMetricsUseCase {
  constructor(
    @inject("OrdersRepository")
    private ordersRepository: IOrdersRepository,
    @inject("TransactionsRepository")
    private transactionsRepository: ITransactionsRepository
  ) {}

  async execute(
    startDateParam?: string,
    endDateParam?: string
  ): Promise<IRevenueMetrics> {
    const startDate = startDateParam
      ? dayjs(startDateParam).startOf("day")
      : dayjs().startOf("day");

    const endDate = endDateParam
      ? dayjs(endDateParam).endOf("day")
      : dayjs(startDate).endOf("day");

    const isStartDateInvalid = !startDate.isValid();
    const isEndDateInvalid = !endDate.isValid();
    if (isStartDateInvalid || isEndDateInvalid) {
      throw new AppError({
        message: "Intervalo de datas inválido",
        statusCode: 400,
      });
    }

    const startDateValue = startDate.toDate();
    const endDateValue = endDate.toDate();
    const isInvertedRange = startDateValue > endDateValue;
    if (isInvertedRange) {
      throw new AppError({
        message: "A data inicial não pode ser posterior à data final",
        statusCode: 400,
      });
    }

    const endDateExclusive = dayjs(endDateValue).add(1, "millisecond").toDate();

    const [paidRevenue, ordersInRange] = await Promise.all([
      this.transactionsRepository.sumPaymentsByDateRange(
        startDateValue,
        endDateExclusive
      ),
      this.ordersRepository.findAllOrdersByDateRange({
        startDate: startDateValue,
        endDate: endDateExclusive,
      }),
    ]);

    const pendingRevenue = this.calculatePendingRevenue(ordersInRange);
    const itemsByType = this.countItemsByType(ordersInRange);

    return {
      startDate: startDate.format("YYYY-MM-DD"),
      endDate: endDate.format("YYYY-MM-DD"),
      ordersCount: ordersInRange.length,
      paidRevenue,
      pendingRevenue,
      itemsByType,
    };
  }

  private calculatePendingRevenue(orders: any[]): number {
    const pendingStates = ["PENDENTE", "VENCIDO", "PARCIALMENTE_PAGO"];

    return orders
      .filter((order) => pendingStates.includes(order.payment_state))
      .reduce((sum, order) => sum + (order.total || 0), 0);
  }

  private countItemsByType(orders: any[]): Record<string, number> {
    const itemsByType: Record<string, number> = {};

    orders.forEach((order) => {
      if (order.orderItems) {
        order.orderItems.forEach((item: any) => {
          const itemType = item.type || item.stock?.type;
          if (itemType) {
            itemsByType[itemType] =
              (itemsByType[itemType] || 0) + item.quantity;
          }
        });
      }
    });

    return itemsByType;
  }
}
