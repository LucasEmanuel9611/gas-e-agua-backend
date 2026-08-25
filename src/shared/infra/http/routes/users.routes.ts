import { ListUserOrdersController } from "@modules/orders/useCases/listUserOrders/ListUserOrdersController";
import { ListUserTransactionsController } from "@modules/orders/useCases/listUserTransactions/ListUserTransactionsController";
import { Router } from "express";

import { ensureAdmin } from "../middlewares/ensureAdmin";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

export const usersRoutes = Router();

const listUserOrdersController = new ListUserOrdersController();
const listUserTransactionsController = new ListUserTransactionsController();

usersRoutes.get(
  "/:userId/orders",
  ensureAuthenticated,
  ensureAdmin,
  listUserOrdersController.handle
);

usersRoutes.get(
  "/:userId/transactions",
  ensureAuthenticated,
  ensureAdmin,
  listUserTransactionsController.handle
);
