import { SendOrderPaymentNotificationsUseCase } from "@modules/orders/useCases/sendOrderPaymentNotifications/SendOrderPaymentNotificationsUseCase";
import { inject, injectable } from "tsyringe";

import { JobService } from "@shared/services/JobService";

@injectable()
export class SendOrderPaymentNotificationsJob {
  constructor(
    @inject("SendOrderPaymentNotificationsUseCase")
    private sendOrderPaymentNotificationsUseCase: SendOrderPaymentNotificationsUseCase
  ) {}

  async execute(): Promise<{ success: boolean; notifications: number }> {
    const result = await JobService.runJob(
      "SendOrderPaymentNotifications",
      () => this.sendOrderPaymentNotificationsUseCase.execute(),
      {
        maxRetries: 3,
        retryDelay: 5000,
        notifyOnError: true,
      }
    );

    if (!result.success) {
      console.error("Falha ao enviar notificações de pagamento:", result.error);
      return { success: false, notifications: 0 };
    }

    const { expirationNotifications, overdueNotifications, total } =
      result.data;

    console.log(
      `Notificações de vencimento enviadas: ${expirationNotifications}`
    );
    console.log(
      `Notificações de pedidos vencidos enviadas: ${overdueNotifications}`
    );
    console.log(`Total de notificações enviadas: ${total}`);

    return { success: true, notifications: total };
  }
}
