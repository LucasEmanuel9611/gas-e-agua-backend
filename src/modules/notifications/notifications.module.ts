import { UserNotificationTokensRepository } from "@modules/accounts/repositories/implementations/UserNotificationTokensRepository";
import { UsersRepository } from "@modules/accounts/repositories/implementations/UsersRepository";
import { IUserNotificationTokensRepository } from "@modules/accounts/repositories/interfaces/IUserNotificationTokensRepository";
import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { OrdersRepository } from "@modules/orders/repositories/implementations/OrdersRepository";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";

import { redisConnection } from "@shared/infra/redis/redisConnection";
import { CleanInvalidTokensTask } from "@shared/infra/tasks/cleanInvalidTokens";
import { ProcessScheduledNotificationsTask } from "@shared/infra/tasks/processScheduledNotifications";
import { SendOrderPaymentNotificationsTask } from "@shared/infra/tasks/sendOrderPaymentNotifications";

import { NotificationWorker } from "./infra/queues/workers/NotificationWorker";
import { NotificationsController } from "./notifications.controller";
import { NotificationHistoryRepository } from "./repositories/implementations/NotificationHistoryRepository";
import { ScheduledNotificationRepository } from "./repositories/implementations/ScheduledNotificationRepository";
import { INotificationHistoryRepository } from "./repositories/INotificationHistoryRepository";
import { ExpoPushService } from "./services/ExpoPushService";
import { NotificationTemplateService } from "./services/NotificationTemplateService";
import { CleanInvalidTokensUseCase } from "./useCases/cleanInvalidTokens/cleanInvalidTokensUseCase";
import { GetUserNotificationHistoryUseCase } from "./useCases/getUserNotificationHistory/getUserNotificationHistoryUseCase";
import { ManageScheduledNotificationsUseCase } from "./useCases/manageScheduledNotifications/manageScheduledNotificationsUseCase";
import { SendPaymentDueIn5DaysNotificationsUseCase } from "./useCases/sendPaymentDueIn5DaysNotifications/sendPaymentDueIn5DaysNotificationsUseCase";
import { SendPaymentDueTomorrowNotificationsUseCase } from "./useCases/sendPaymentDueTomorrowNotifications/sendPaymentDueTomorrowNotificationsUseCase";
import { SendPaymentLateNotificationsUseCase } from "./useCases/sendPaymentLateNotifications/sendPaymentLateNotificationsUseCase";
import { SendNotificationUseCase } from "./useCases/sendNotification/sendNotificationUseCase";

@Module({
  imports: [
    BullModule.forRoot({
      connection: redisConnection,
    }),
    BullModule.registerQueue({
      name: "notifications",
    }),
  ],
  controllers: [NotificationsController],
  providers: [
    SendNotificationUseCase,
    GetUserNotificationHistoryUseCase,
    CleanInvalidTokensUseCase,
    ManageScheduledNotificationsUseCase,
    SendPaymentDueIn5DaysNotificationsUseCase,
    SendPaymentDueTomorrowNotificationsUseCase,
    SendPaymentLateNotificationsUseCase,
    NotificationTemplateService,
    NotificationWorker,
    CleanInvalidTokensTask,
    ProcessScheduledNotificationsTask,
    SendOrderPaymentNotificationsTask,
    { provide: "UsersRepository", useClass: UsersRepository },
    { provide: "OrdersRepository", useClass: OrdersRepository },
    {
      provide: "UserNotificationTokensRepository",
      useClass: UserNotificationTokensRepository,
    },
    {
      provide: "NotificationHistoryRepository",
      useClass: NotificationHistoryRepository,
    },
    {
      provide: "ScheduledNotificationRepository",
      useClass: ScheduledNotificationRepository,
    },
    {
      provide: ExpoPushService,
      useFactory: (
        usersRepository: IUsersRepository,
        tokenRepository: IUserNotificationTokensRepository,
        historyRepository: INotificationHistoryRepository
      ) =>
        new ExpoPushService(
          usersRepository,
          tokenRepository,
          historyRepository
        ),
      inject: [
        "UsersRepository",
        "UserNotificationTokensRepository",
        "NotificationHistoryRepository",
      ],
    },
  ],
})
export class NotificationsModule {}
