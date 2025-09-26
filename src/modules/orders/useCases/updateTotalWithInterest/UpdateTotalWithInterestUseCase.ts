import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { ITransactionsRepository } from "@modules/transactions/repositories/ITransactionsRepository";
import { inject, injectable } from "tsyringe";

import { IDateProvider } from "@shared/containers/DateProvider/IDateProvider";

import dayjs from "../../../../config/dayjs.config";

@injectable()
export class UpdateTotalWithInterestUseCase {
  constructor(
    @inject("OrdersRepository")
    private ordersRepository: IOrdersRepository,
    @inject("TransactionsRepository")
    private transactionsRepository: ITransactionsRepository,
    @inject("DayjsDateProvider")
    private dayjsDateProvider: IDateProvider
  ) {}

  // $10 after 15 days + $1 per day after 30
  private calculateTotalWithInterest(order: {
    total: number;
    created_at: Date;
    interest_allowed: boolean;
    orderItems?: Array<{ stock?: { type: string }; quantity: number }>;
  }): number {
    const allowInterest = order.interest_allowed;
    const hasGas = order.orderItems?.some(
      (item) => item.stock?.type === "GAS" && item.quantity > 0
    );

    if (!allowInterest || !hasGas) {
      return order.total;
    }

    const createdDate = dayjs(order.created_at).toDate();
    const differenceDays = this.dayjsDateProvider.getDaysDifference(
      this.dayjsDateProvider.dateNow(),
      createdDate
    );

    let interestValue = 0;

    const daysOfInterestAfterThirtyDays = differenceDays - 30;

    if (differenceDays > 30) {
      interestValue = 10 + daysOfInterestAfterThirtyDays;
    } else if (differenceDays > 15) {
      interestValue = 10;
    }

    return order.total + interestValue;
  }

  async execute() {
    const orders =
      await this.ordersRepository.findOrdersWithGasAndInterestAllowed();

    const updates = orders.map(async (order) => {
      const orderWithDate = {
        ...order,
        created_at: dayjs(order.created_at).toDate(),
      };
      const newTotal = this.calculateTotalWithInterest(orderWithDate);
      const needsUpdate = newTotal !== order.total;
      if (needsUpdate) {
        const interestValue = newTotal - order.total;
        await this.transactionsRepository.create({
          order_id: order.id,
          type: "INTEREST",
          amount: interestValue,
          old_value: order.total,
          new_value: newTotal,
          notes: "Juros por atraso",
        });
        await this.ordersRepository.updateById(order.id, { total: newTotal });
      }
    });

    await Promise.all(updates);
  }
}
