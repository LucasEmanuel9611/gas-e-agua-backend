import { UsersRepository } from "@modules/accounts/repositories/implementations/UsersRepository";
import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { OrdersRepository } from "@modules/orders/repositories/implementations/OrdersRepository";
import { TransactionsRepository } from "@modules/orders/repositories/implementations/TransactionsRepository";
import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { ITransactionsRepository } from "@modules/orders/repositories/ITransactionsRepository";
import { StockRepository } from "@modules/stock/repositories/implementations/StockRepository";
import { IStockRepository } from "@modules/stock/repositories/IStockRepository";
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
