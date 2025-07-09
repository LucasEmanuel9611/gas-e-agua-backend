import { FindTransactionByIdController } from "@modules/transactions/useCases/findTransactionById/FindTransactionByIdController";
import { FindTransactionsByOrderIdController } from "@modules/transactions/useCases/findTransactionsByOrderId/FindTransactionsByOrderIdController";
import { PaymentController } from "@modules/transactions/useCases/payment/PaymentController";
import { Router } from "express";

import { ensureAuthenticated } from "@shared/infra/http/middlewares/ensureAuthenticated";

import { ensureAdmin } from "../middlewares/ensureAdmin";

const transactionsRoutes = Router();

const paymentController = new PaymentController();
const findTransactionByIdController = new FindTransactionByIdController();
const findTransactionsByOrderIdController =
  new FindTransactionsByOrderIdController();

transactionsRoutes.post("/payment", ensureAdmin, paymentController.handle);

transactionsRoutes.get(
  "/:id",
  ensureAuthenticated,
  findTransactionByIdController.handle
);

transactionsRoutes.get(
  "/order/:order_id",
  ensureAuthenticated,
  findTransactionsByOrderIdController.handle
);

export { transactionsRoutes };
