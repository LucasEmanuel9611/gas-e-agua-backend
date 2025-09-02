import { UserAddressRepository } from "@modules/accounts/repositories/implementations/UserAddressRepository";
import { UsersRepository } from "@modules/accounts/repositories/implementations/UsersRepository";
import { IUserAddressRepository } from "@modules/accounts/repositories/interfaces/IUserAddressRepository";
import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { IAddonsRepository } from "@modules/addons/repositories/IAddonsRepository";
import { AddonsRepository } from "@modules/addons/repositories/implementations/AddonsRepository";
import { OrdersRepository } from "@modules/orders/repositories/implementations/OrdersRepository";
import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { IOrderCreationService } from "@modules/orders/services/IOrderCreationService";
import { OrderCreationService } from "@modules/orders/services/OrderCreationService";
import { SendNotificationUseCase } from "@modules/orders/useCases/sendNewOrderNotificationAdmin/SendNewOrderNotificationAdminUseCase";
import { SendOrderPaymentNotificationsUseCase } from "@modules/orders/useCases/sendOrderPaymentNotifications/SendOrderPaymentNotificationsUseCase";
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

container.registerSingleton<SendNotificationUseCase>(SendNotificationUseCase);

container.registerSingleton<SendOrderPaymentNotificationsUseCase>(
  SendOrderPaymentNotificationsUseCase
);
