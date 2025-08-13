import { ConcludeOrderController } from "@modules/orders/useCases/concludeOrder/ConcludeOrderController";
import { CreateOrderController } from "@modules/orders/useCases/createOrder/CreateOrderController";
import { DeleteOrderController } from "@modules/orders/useCases/deleteOrder/DeleteOrderController";
import { EditOrderController } from "@modules/orders/useCases/editOrderUseCase/EditOrderController";
import { ListOrdersController } from "@modules/orders/useCases/listOrders/listOrdersController";
import { Router } from "express";

import { ensureAdmin } from "../middlewares/ensureAdmin";
import { ensureAdminForAllScope } from "../middlewares/ensureAdminForAllScope";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

export const orderRoutes = Router();

const createOrderController = new CreateOrderController();
const deleteOrderController = new DeleteOrderController();
const editOrderController = new EditOrderController();
const listOrdersController = new ListOrdersController();
const concludeOrderController = new ConcludeOrderController();

orderRoutes.post("/", ensureAuthenticated, createOrderController.handle);
orderRoutes.put("/:id", ensureAuthenticated, editOrderController.handle);
orderRoutes.delete("/:id", ensureAuthenticated, deleteOrderController.handle);
orderRoutes.get(
  "/",
  ensureAuthenticated,
  ensureAdminForAllScope,
  listOrdersController.handle
);
orderRoutes.put(
  "/:id/conclude",
  ensureAuthenticated,
  ensureAdmin,
  concludeOrderController.handle
);
