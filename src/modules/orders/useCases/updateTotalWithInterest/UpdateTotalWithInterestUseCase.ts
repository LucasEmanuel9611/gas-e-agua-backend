import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import dayjs from "dayjs";
import { inject, injectable } from "tsyringe";

@injectable()
export class UpdateTotalWithInterestUseCase {
  constructor(
    @inject("OrdersRepository")
    private ordersRepository: IOrdersRepository
  ) {}

  private calculateTotalWithInterest(order: {
    total: number;
    gasAmount: number;
    created_at: Date;
    interest_allowed: boolean;
  }): number {
    if (!order.interest_allowed || order.gasAmount <= 0) {
      return order.total;
    }

    const days = dayjs().diff(dayjs(order.created_at), "day");
    let increment = 0;

    if (days > 30) {
      increment = 10 + (days - 30); // $10 after 15 days + $1 per day after 30
    } else if (days > 15) {
      increment = 10;
    }

    return order.total + increment;
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
