import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { inject, injectable } from "tsyringe";

import { IDateProvider } from "@shared/containers/DateProvider/IDateProvider";

@injectable()
export class UpdateTotalWithInterestUseCase {
  constructor(
    @inject("OrdersRepository")
    private ordersRepository: IOrdersRepository,
    @inject("DayjsDateProvider")
    private dayjsDateProvider: IDateProvider
  ) {}

  // $10 after 15 days + $1 per day after 30
  private calculateTotalWithInterest(order: {
    total: number;
    gasAmount: number;
    created_at: Date;
    interest_allowed: boolean;
  }): number {
    const allowInterest = order.interest_allowed;
    const hasGas = order.gasAmount;

    if (allowInterest || hasGas) {
      return order.total;
    }

    const differenceDays = this.dayjsDateProvider.getDaysDifference(
      this.dayjsDateProvider.dateNow(),
      order.created_at
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

    const updates = orders.map((order) => {
      const newTotal = this.calculateTotalWithInterest(order);

      if (newTotal !== order.total_with_interest) {
        return this.ordersRepository.updateTotalWithInterest(
          order.id,
          newTotal
        );
      }

      return null;
    });

    await Promise.all(updates.filter(Boolean));
    console.log("Total with interest updated.");
  }
}
