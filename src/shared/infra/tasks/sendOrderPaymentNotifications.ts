import { SendPaymentDueIn5DaysNotificationsUseCase } from "@modules/notifications/useCases/sendPaymentDueIn5DaysNotifications/sendPaymentDueIn5DaysNotificationsUseCase";
import { SendPaymentDueTomorrowNotificationsUseCase } from "@modules/notifications/useCases/sendPaymentDueTomorrowNotifications/sendPaymentDueTomorrowNotificationsUseCase";
import { SendPaymentLateNotificationsUseCase } from "@modules/notifications/useCases/sendPaymentLateNotifications/sendPaymentLateNotificationsUseCase";
import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";

@Injectable()
export class SendOrderPaymentNotificationsTask {
  constructor(
    private readonly sendPaymentDueIn5DaysNotificationsUseCase: SendPaymentDueIn5DaysNotificationsUseCase,
    private readonly sendPaymentDueTomorrowNotificationsUseCase: SendPaymentDueTomorrowNotificationsUseCase,
    private readonly sendPaymentLateNotificationsUseCase: SendPaymentLateNotificationsUseCase
  ) {}

  @Cron("0 12 * * *")
  async handle() {
    console.log("[CRON] Iniciando verificação de notificações de pagamento...");
    console.log("[CRON] Tipos de notificações que serão verificadas:");
    console.log("  📅 PAYMENT_DUE_IN_5_DAYS: Pedidos que vencem em 5 dias");
    console.log("  ⏰ PAYMENT_DUE_TOMORROW: Pedidos que vencem amanhã");
    console.log(
      "  ⚠️  PAYMENT_LATE: Pedidos em atraso (a cada 5 dias após vencimento)"
    );

    try {
      const [dueIn5DaysResult, dueTomorrowResult, lateResult] =
        await Promise.all([
          this.sendPaymentDueIn5DaysNotificationsUseCase.execute(),
          this.sendPaymentDueTomorrowNotificationsUseCase.execute(),
          this.sendPaymentLateNotificationsUseCase.execute(),
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
  }
}
