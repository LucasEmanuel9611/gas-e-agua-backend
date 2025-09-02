import { SendOrderPaymentNotificationsJob } from "@modules/orders/jobs/SendOrderPaymentNotificationsJob";
import cron from "node-cron";
import { container } from "tsyringe";

export function scheduleSendOrderPaymentNotifications() {
  cron.schedule("0 12 * * *", async () => {
    console.log("[CRON] Iniciando verificação de notificações de pagamento...");

    const sendOrderPaymentNotificationsJob = container.resolve(
      SendOrderPaymentNotificationsJob
    );

    const result = await sendOrderPaymentNotificationsJob.execute();

    if (result.success) {
      console.log(
        `[CRON - Notificações de pagamento] - ${result.notifications} notificações enviadas.`
      );
    } else {
      console.error("[CRON - Notificações de pagamento] - Falha na execução.");
    }
  });
}
