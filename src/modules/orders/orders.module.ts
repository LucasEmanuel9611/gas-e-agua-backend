import { UserNotificationTokensRepository } from "@modules/accounts/repositories/implementations/UserNotificationTokensRepository";
import { UserAddressRepository } from "@modules/accounts/repositories/implementations/UserAddressRepository";
import { UsersRepository } from "@modules/accounts/repositories/implementations/UsersRepository";
import { IUserNotificationTokensRepository } from "@modules/accounts/repositories/interfaces/IUserNotificationTokensRepository";
import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { NotificationHistoryRepository } from "@modules/notifications/repositories/implementations/NotificationHistoryRepository";
import { INotificationHistoryRepository } from "@modules/notifications/repositories/INotificationHistoryRepository";
import { ExpoPushService } from "@modules/notifications/services/ExpoPushService";
import { StockRepository } from "@modules/stock/repositories/implementations/StockRepository";
import { TransactionsRepository } from "@modules/transactions/repositories/implementations/TransactionsRepository";
import { Module } from "@nestjs/common";

import { DayjsDateProvider } from "@shared/containers/DateProvider";
import { UpdateOrderValueAddInterestTask } from "@shared/infra/tasks/updateOrderValueAddInterest";
import { UpdateOverdueOrdersTask } from "@shared/infra/tasks/updateOverdueOrders";

import { UpdateOverdueOrdersJob } from "./jobs/UpdateOverdueOrdersJob";
import { UpdateTotalWithInterestJob } from "./jobs/UpdateTotalWithInterestJob";
import { OrdersController } from "./orders.controller";
import { OrdersRepository } from "./repositories/implementations/OrdersRepository";
import { OrderCreationService } from "./services/OrderCreationService";
import { ConcludeOrderUseCase } from "./useCases/concludeOrder/ConcludeOrderUseCase";
import { CreateOrderUseCase } from "./useCases/createOrder/CreateOrderUseCase";
import { DeleteOrderUseCase } from "./useCases/deleteOrder/DeleteOrderUseCase";
import { EditOrderUseCase } from "./useCases/editOrderUseCase/EditOrderUseCase";
import { GetAdminHomeDashboardUseCase } from "./useCases/getAdminHomeDashboard/GetAdminHomeDashboardUseCase";
import { GetDeliveryDaySummaryUseCase } from "./useCases/getDeliveryDaySummary/GetDeliveryDaySummaryUseCase";
import { GetOrderByIdUseCase } from "./useCases/getOrderById/GetOrderByIdUseCase";
import { ListOrdersUseCase } from "./useCases/listOrders/ListOrdersUseCase";
import { ListUserOrdersUseCase } from "./useCases/listUserOrders/ListUserOrdersUseCase";
import { ListUserTransactionsUseCase } from "./useCases/listUserTransactions/ListUserTransactionsUseCase";
import { UpdateOverdueOrdersUseCase } from "./useCases/updateOverdueOrders/updateOverdueOrdersUseCase";
import { UpdatePaymentStateUseCase } from "./useCases/updatePaymentState/UpdatePaymentStateUseCase";
import { UpdateTotalWithInterestUseCase } from "./useCases/updateTotalWithInterest/UpdateTotalWithInterestUseCase";
import { UsersOrdersController } from "./users-orders.controller";

@Module({
  controllers: [OrdersController, UsersOrdersController],
  providers: [
    CreateOrderUseCase,
    EditOrderUseCase,
    DeleteOrderUseCase,
    ListOrdersUseCase,
    GetAdminHomeDashboardUseCase,
    GetDeliveryDaySummaryUseCase,
    GetOrderByIdUseCase,
    ConcludeOrderUseCase,
    UpdatePaymentStateUseCase,
    ListUserOrdersUseCase,
    ListUserTransactionsUseCase,
    UpdateOverdueOrdersJob,
    UpdateTotalWithInterestJob,
    UpdateOverdueOrdersTask,
    UpdateOrderValueAddInterestTask,
    { provide: "OrdersRepository", useClass: OrdersRepository },
    { provide: "OrderCreationService", useClass: OrderCreationService },
    { provide: "StockRepository", useClass: StockRepository },
    { provide: "TransactionsRepository", useClass: TransactionsRepository },
    { provide: "UsersRepository", useClass: UsersRepository },
    { provide: "UserAddressRepository", useClass: UserAddressRepository },
    {
      provide: "UserNotificationTokensRepository",
      useClass: UserNotificationTokensRepository,
    },
    {
      provide: "NotificationHistoryRepository",
      useClass: NotificationHistoryRepository,
    },
    {
      provide: "DayjsDateProvider",
      useClass: DayjsDateProvider,
    },
    {
      provide: "UpdateOverdueOrdersUseCase",
      useClass: UpdateOverdueOrdersUseCase,
    },
    {
      provide: "UpdateTotalWithInterestUseCase",
      useClass: UpdateTotalWithInterestUseCase,
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
export class OrdersModule {}
