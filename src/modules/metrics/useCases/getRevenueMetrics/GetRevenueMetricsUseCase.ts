import dayjs from "@config/dayjs.config";
import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { OrderProps } from "@modules/orders/types";
import { ITransactionsRepository } from "@modules/transactions/repositories/ITransactionsRepository";
import { inject, injectable } from "tsyringe";

import { AppError } from "@shared/errors/AppError";

import { IRevenueMetrics } from "../../types";

const BUSINESS_TIMEZONE = "America/Recife";

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
    const startDate = this.resolveBusinessDayStart(startDateParam);
    const endDate = this.resolveBusinessDayEnd(endDateParam, startDate);

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

    const formattedStartDate = startDate.format("YYYY-MM-DD");
    const formattedEndDate = endDate.format("YYYY-MM-DD");
    const endDateExclusive = endDate.clone().add(1, "millisecond").toDate();

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
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      ordersCount: ordersInRange.length,
      paidRevenue,
      pendingRevenue,
      itemsByType,
    };
  }

  private resolveBusinessDayStart(startDateParam?: string) {
    if (!startDateParam) {
      return dayjs().tz(BUSINESS_TIMEZONE).startOf("day");
    }

    const parsedStartDate = dayjs(startDateParam);
    if (!parsedStartDate.isValid()) {
      return parsedStartDate;
    }

    return dayjs
      .tz(parsedStartDate.format("YYYY-MM-DD"), BUSINESS_TIMEZONE)
      .startOf("day");
  }

  private resolveBusinessDayEnd(
    endDateParam: string | undefined,
    startDate: dayjs.Dayjs
  ) {
    if (!endDateParam) {
      return startDate.clone().endOf("day");
    }

    const parsedEndDate = dayjs(endDateParam);
    if (!parsedEndDate.isValid()) {
      return parsedEndDate;
    }

    return dayjs
      .tz(parsedEndDate.format("YYYY-MM-DD"), BUSINESS_TIMEZONE)
      .endOf("day");
  }

  private calculatePendingRevenue(orders: OrderProps[]): number {
    return orders
      .filter((order) => order.payment_state !== "PAGO")
      .reduce((sum, order) => sum + (order.total || 0), 0);
  }

  private countItemsByType(orders: OrderProps[]): Record<string, number> {
    return orders
      .flatMap((order) => order.orderItems ?? [])
      .reduce((itemsByType, item) => {
        const itemType = item.stock?.type;
        if (!itemType) {
          return itemsByType;
        }

        const nextQuantity = (itemsByType[itemType] ?? 0) + item.quantity;

        return {
          ...itemsByType,
          [itemType]: nextQuantity,
        };
      }, {} as Record<string, number>);
  }
}
