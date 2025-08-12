import { UsersRepository } from "@modules/accounts/repositories/implementations/UsersRepository";
import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { OrdersRepository } from "@modules/orders/repositories/implementations/OrdersRepository";
import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { OrderCreationService } from "@modules/orders/services/OrderCreationService";
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

container.registerSingleton<ITransactionsRepository>(
  "TransactionsRepository",
  TransactionsRepository
);

container.registerSingleton<OrderCreationService>(
  "OrderCreationService",
  OrderCreationService
);
