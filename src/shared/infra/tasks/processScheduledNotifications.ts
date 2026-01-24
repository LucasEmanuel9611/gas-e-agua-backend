import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { notificationQueue } from "@modules/notifications/infra/queues/NotificationQueue";
import { IScheduledNotificationRepository } from "@modules/notifications/repositories/IScheduledNotificationRepository";
import { NotificationPriority } from "@modules/notifications/types/NotificationTypes";
import { RecurrencePattern } from "@modules/notifications/types/scheduledNotification";
import cron from "node-cron";
import { container } from "tsyringe";

function calculateNextRun(currentDate: Date, pattern: RecurrencePattern): Date {
  const next = new Date(currentDate);

  switch (pattern) {
    case RecurrencePattern.DAILY:
      next.setDate(next.getDate() + 1);
      break;
    case RecurrencePattern.WEEKLY:
      next.setDate(next.getDate() + 7);
      break;
    case RecurrencePattern.MONTHLY:
      next.setMonth(next.getMonth() + 1);
      break;
    case RecurrencePattern.YEARLY:
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      next.setDate(next.getDate() + 1);
      break;
  }

  return next;
}

export function scheduleProcessScheduledNotifications() {
  cron.schedule("*/5 * * * *", async () => {
    console.log("[CRON] Verificando notificações agendadas...");

    const scheduledNotificationRepository =
      container.resolve<IScheduledNotificationRepository>(
        "ScheduledNotificationRepository"
      );
    const usersRepository =
      container.resolve<IUsersRepository>("UsersRepository");

    try {
      const now = new Date();
      const dueNotifications = await scheduledNotificationRepository.findDue(
        now
      );

      if (dueNotifications.length === 0) {
        console.log(
          "[CRON - Notificações Agendadas] - Nenhuma notificação pendente"
        );
        return;
      }

      console.log(
        `[CRON - Notificações Agendadas] - ${dueNotifications.length} notificações encontradas`
      );

      await Promise.all(
        dueNotifications.map(async (scheduled) => {
          try {
            let targetUsers: number[] = [];

            if (scheduled.target_users) {
              targetUsers = JSON.parse(scheduled.target_users);
            } else if (scheduled.target_roles) {
              const roles = JSON.parse(scheduled.target_roles);
              const { users } = await usersRepository.findAll({
                page: 1,
                limit: 10000,
                offset: 0,
              });
              targetUsers = users
                .filter((user) => roles.includes(user.role))
                .map((user) => user.id);
            }

            if (targetUsers.length === 0) {
              console.warn(
                `[CRON - Notificações Agendadas] - Nenhum usuário alvo para ID ${scheduled.id}`
              );
              return;
            }

            const customData = scheduled.data ? JSON.parse(scheduled.data) : {};

            await Promise.all(
              targetUsers.map(async (userId) => {
                await notificationQueue.addBulkNotification(
                  "scheduled_notification",
                  [userId],
                  undefined,
                  {
                    ...customData,
                    scheduledNotificationId: scheduled.id,
                    title: scheduled.title,
                    body: scheduled.body,
                  },
                  NotificationPriority.NORMAL
                );
              })
            );

            await scheduledNotificationRepository.updateLastSentAt(
              scheduled.id,
              now
            );

            if (scheduled.recurrence_pattern) {
              const nextRunAt = calculateNextRun(
                now,
                scheduled.recurrence_pattern as RecurrencePattern
              );
              await scheduledNotificationRepository.updateNextRunAt(
                scheduled.id,
                nextRunAt
              );
              console.log(
                `[CRON - Notificações Agendadas] - Notificação ID ${scheduled.id} reagendada para ${nextRunAt}`
              );
            } else {
              await scheduledNotificationRepository.update({
                id: scheduled.id,
                is_active: false,
              });
              console.log(
                `[CRON - Notificações Agendadas] - Notificação ID ${scheduled.id} desativada (não recorrente)`
              );
            }

            console.log(
              `[CRON - Notificações Agendadas] - Notificação ID ${scheduled.id} enfileirada para ${targetUsers.length} usuários`
            );
          } catch (error) {
            console.error(
              `[CRON - Notificações Agendadas] - Erro ao processar notificação ID ${scheduled.id}:`,
              error
            );
          }
        })
      );
    } catch (error) {
      console.error("[CRON - Notificações Agendadas] - Erro geral:", error);
    }
  });
}
