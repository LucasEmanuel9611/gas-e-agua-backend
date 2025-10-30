import { SendOrderPaymentNotificationsUseCase as NewSendOrderPaymentNotificationsUseCase } from "@modules/notifications/useCases/sendOrderPaymentNotifications/sendOrderPaymentNotificationsUseCase";
import cron from "node-cron";
import { container } from "tsyringe";

export function scheduleSendOrderPaymentNotifications() {
  cron.schedule("0 12 * * *", async () => {
    console.log("[CRON] Iniciando verificação de notificações de pagamento...");
    console.log("[CRON] Tipos de notificações que serão verificadas:");
    console.log("  📅 EXPIRATION: Pedidos próximos do vencimento (29-30 dias)");
    console.log("  ⚠️  OVERDUE: Pedidos vencidos (a cada 5 dias após vencimento)");

    const sendOrderPaymentNotificationsUseCase = container.resolve(
      NewSendOrderPaymentNotificationsUseCase
    );

    const result = await sendOrderPaymentNotificationsUseCase.execute();

    if (result.total > 0) {
      console.log(
        `[CRON - Notificações de pagamento] - ${result.total} notificações enfileiradas:`
      );
      console.log(
        `  📅 EXPIRATION: ${result.expirationNotifications} notificações de vencimento`
      );
      console.log(
        `  ⚠️  OVERDUE: ${result.overdueNotifications} notificações de pedidos vencidos`
      );

      if (result.errors.length > 0) {
        console.warn(
          `[CRON - Notificações de pagamento] - ${result.errors.length} erros encontrados:`,
          result.errors
        );
      }
    } else {
      console.log(
        "[CRON - Notificações de pagamento] - Nenhuma notificação enfileirada."
      );
    }
  });
}
