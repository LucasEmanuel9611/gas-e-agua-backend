import { OrderProps } from "@modules/orders/types";
import { Injectable } from "@nestjs/common";
import dayjs from "dayjs";

import { NotificationType } from "../../types/NotificationTypes";
import { BasePaymentNotificationUseCase } from "../base/BasePaymentNotificationUseCase";

@Injectable()
export class SendPaymentDueIn5DaysNotificationsUseCase extends BasePaymentNotificationUseCase {
  protected async getOrders(): Promise<OrderProps[]> {
    const start = dayjs().subtract(25, "days").startOf("day").toDate();
    const end = dayjs().subtract(25, "days").endOf("day").toDate();

    return this.ordersRepository.findOrdersByDateRange({
      startDate: start,
      endDate: end,
      paymentState: "PENDENTE",
    });
  }

  protected getCustomData(order: OrderProps): Record<string, unknown> {
    return {
      orderId: order.id,
      daysUntilDue: 5,
      urgency: "medium",
    };
  }

  protected getLogPrefix(): string {
    return "📅 PAYMENT_DUE_IN_5_DAYS";
  }

  protected getNotificationType(): NotificationType {
    return NotificationType.PAYMENT_DUE_SOON;
  }
}
