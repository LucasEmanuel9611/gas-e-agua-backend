import { OrderProps } from "@modules/orders/types";
import dayjs from "dayjs";
import { injectable } from "tsyringe";

import { BasePaymentNotificationUseCase } from "../base/BasePaymentNotificationUseCase";

@injectable()
export class SendPaymentDueTomorrowNotificationsUseCase extends BasePaymentNotificationUseCase {
  protected async getOrders(): Promise<OrderProps[]> {
    const start = dayjs().subtract(29, "days").startOf("day").toDate();
    const end = dayjs().subtract(29, "days").endOf("day").toDate();

    return this.ordersRepository.findOrdersByDateRange({
      startDate: start,
      endDate: end,
      paymentState: "PENDENTE",
    });
  }

  protected getCustomData(order: OrderProps): Record<string, unknown> {
    return {
      orderId: order.id,
      daysUntilDue: 1,
      urgency: "high",
      isLastChance: true,
    };
  }

  protected getLogPrefix(): string {
    return "⚠️ PAYMENT_DUE_TOMORROW";
  }
}
