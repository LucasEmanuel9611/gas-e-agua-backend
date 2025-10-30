import { UserAddressRepository } from "@modules/accounts/repositories/implementations/UserAddressRepository";
import { UsersRepository } from "@modules/accounts/repositories/implementations/UsersRepository";
import { IUserAddressRepository } from "@modules/accounts/repositories/interfaces/IUserAddressRepository";
import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { IAddonsRepository } from "@modules/addons/repositories/IAddonsRepository";
import { AddonsRepository } from "@modules/addons/repositories/implementations/AddonsRepository";
import { NotificationWorker } from "@modules/notifications/infra/queues/workers/NotificationWorker";
import { NotificationHistoryRepository } from "@modules/notifications/repositories/implementations/NotificationHistoryRepository";
import { ScheduledNotificationRepository } from "@modules/notifications/repositories/implementations/ScheduledNotificationRepository";
import { INotificationHistoryRepository } from "@modules/notifications/repositories/INotificationHistoryRepository";
import { IScheduledNotificationRepository } from "@modules/notifications/repositories/IScheduledNotificationRepository";
import { ExpoPushService } from "@modules/notifications/services/ExpoPushService";
import { NotificationTemplateService } from "@modules/notifications/services/NotificationTemplateService";
import { SendNotificationUseCase } from "@modules/notifications/useCases/sendNotification/sendNotificationUseCase";
import { SendPaymentDueIn5DaysNotificationsUseCase } from "@modules/notifications/useCases/sendPaymentDueIn5DaysNotifications/sendPaymentDueIn5DaysNotificationsUseCase";
import { SendPaymentDueTomorrowNotificationsUseCase } from "@modules/notifications/useCases/sendPaymentDueTomorrowNotifications/sendPaymentDueTomorrowNotificationsUseCase";
import { SendPaymentLateNotificationsUseCase } from "@modules/notifications/useCases/sendPaymentLateNotifications/sendPaymentLateNotificationsUseCase";
import { OrdersRepository } from "@modules/orders/repositories/implementations/OrdersRepository";
import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { IOrderCreationService } from "@modules/orders/services/IOrderCreationService";
import { OrderCreationService } from "@modules/orders/services/OrderCreationService";
import { SendNotificationUseCase as LegacySendNotificationUseCase } from "@modules/orders/useCases/sendNewOrderNotificationAdmin/SendNewOrderNotificationAdminUseCase";
import { StockRepository } from "@modules/stock/repositories/implementations/StockRepository";
import { IStockRepository } from "@modules/stock/repositories/IStockRepository";
import { TransactionsRepository } from "@modules/transactions/repositories/implementations/TransactionsRepository";
import { ITransactionsRepository } from "@modules/transactions/repositories/ITransactionsRepository";
import { container } from "tsyringe";

import { DayjsDateProvider } from "./DateProvider";
import { IDateProvider } from "./DateProvider/IDateProvider";

container.registerSingleton<IUsersRepository>(
  "UsersRepository",
  UsersRepository
);

container.registerSingleton<IUserAddressRepository>(
  "UserAddressRepository",
  UserAddressRepository
);

container.registerSingleton<IDateProvider>(
  "DayjsDateProvider",
  DayjsDateProvider
);

container.registerSingleton<IOrdersRepository>(
  "OrdersRepository",
  OrdersRepository
);

container.registerSingleton<IStockRepository>(
  "StockRepository",
  StockRepository
);

container.registerSingleton<IAddonsRepository>(
  "AddonsRepository",
  AddonsRepository
);

container.registerSingleton<ITransactionsRepository>(
  "TransactionsRepository",
  TransactionsRepository
);

container.registerSingleton<IOrderCreationService>(
  "OrderCreationService",
  OrderCreationService
);

// === NOTIFICAÇÕES BULLMQ ===
container.registerSingleton<IScheduledNotificationRepository>(
  "ScheduledNotificationRepository",
  ScheduledNotificationRepository
);
container.registerSingleton<INotificationHistoryRepository>(
  "NotificationHistoryRepository",
  NotificationHistoryRepository
);
container.registerSingleton<ExpoPushService>(ExpoPushService);
container.registerSingleton<NotificationTemplateService>(
  NotificationTemplateService
);
container.registerSingleton<NotificationWorker>(NotificationWorker);
container.registerSingleton<SendNotificationUseCase>(SendNotificationUseCase);
container.registerSingleton<SendPaymentDueIn5DaysNotificationsUseCase>(
  SendPaymentDueIn5DaysNotificationsUseCase
);
container.registerSingleton<SendPaymentDueTomorrowNotificationsUseCase>(
  SendPaymentDueTomorrowNotificationsUseCase
);
container.registerSingleton<SendPaymentLateNotificationsUseCase>(
  SendPaymentLateNotificationsUseCase
);

// === LEGACY (manter compatibilidade) ===
container.registerSingleton<LegacySendNotificationUseCase>(
  LegacySendNotificationUseCase
);
