import { SendPaymentDueIn5DaysNotificationsUseCase } from "@modules/notifications/useCases/sendPaymentDueIn5DaysNotifications/sendPaymentDueIn5DaysNotificationsUseCase";
import { SendPaymentDueTomorrowNotificationsUseCase } from "@modules/notifications/useCases/sendPaymentDueTomorrowNotifications/sendPaymentDueTomorrowNotificationsUseCase";
import { SendPaymentLateNotificationsUseCase } from "@modules/notifications/useCases/sendPaymentLateNotifications/sendPaymentLateNotificationsUseCase";
import cron from "node-cron";
import { container } from "tsyringe";

export function scheduleSendOrderPaymentNotifications() {
  cron.schedule("0 12 * * *", async () => {
    console.log("[CRON] Iniciando verificação de notificações de pagamento...");
    console.log("[CRON] Tipos de notificações que serão verificadas:");
    console.log("  📅 PAYMENT_DUE_IN_5_DAYS: Pedidos que vencem em 5 dias");
    console.log("  ⏰ PAYMENT_DUE_TOMORROW: Pedidos que vencem amanhã");
    console.log(
      "  ⚠️  PAYMENT_LATE: Pedidos em atraso (a cada 5 dias após vencimento)"
    );

    const sendPaymentDueIn5DaysNotificationsUseCase = container.resolve(
      SendPaymentDueIn5DaysNotificationsUseCase
    );
    const sendPaymentDueTomorrowNotificationsUseCase = container.resolve(
      SendPaymentDueTomorrowNotificationsUseCase
    );
    const sendPaymentLateNotificationsUseCase = container.resolve(
      SendPaymentLateNotificationsUseCase
    );

    try {
      const [dueIn5DaysResult, dueTomorrowResult, lateResult] =
        await Promise.all([
          sendPaymentDueIn5DaysNotificationsUseCase.execute(),
          sendPaymentDueTomorrowNotificationsUseCase.execute(),
          sendPaymentLateNotificationsUseCase.execute(),
        ]);

      const totalNotifications =
        dueIn5DaysResult.notificationsSent +
        dueTomorrowResult.notificationsSent +
        lateResult.notificationsSent;
      const allErrors = [
        ...dueIn5DaysResult.errors,
        ...dueTomorrowResult.errors,
        ...lateResult.errors,
      ];

      if (totalNotifications > 0) {
        console.log(
          `[CRON - Notificações de pagamento] - ${totalNotifications} notificações enfileiradas:`
        );
        console.log(
          `  📅 PAYMENT_DUE_IN_5_DAYS: ${dueIn5DaysResult.notificationsSent} lembretes (5 dias)`
        );
        console.log(
          `  ⏰ PAYMENT_DUE_TOMORROW: ${dueTomorrowResult.notificationsSent} lembretes (1 dia)`
        );
        console.log(
          `  ⚠️  PAYMENT_LATE: ${lateResult.notificationsSent} cobranças de atraso`
        );

        if (allErrors.length > 0) {
          console.warn(
            `[CRON - Notificações de pagamento] - ${allErrors.length} erros encontrados:`,
            allErrors
          );
        }
      } else {
        console.log(
          "[CRON - Notificações de pagamento] - Nenhuma notificação enfileirada."
        );
      }
    } catch (error) {
      console.error("[CRON - Notificações de pagamento] - Erro geral:", error);
    }
  });
}
