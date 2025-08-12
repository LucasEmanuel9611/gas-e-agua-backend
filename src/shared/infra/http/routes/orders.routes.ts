import { ConcludeOrderController } from "@modules/orders/useCases/concludeOrder/ConcludeOrderController";
import { CreateOrderController } from "@modules/orders/useCases/createOrder/CreateOrderController";
import { CreateOrderAsAdminController } from "@modules/orders/useCases/createOrderAsAdmin/CreateOrderAsAdminController";
import { DeleteOrderController } from "@modules/orders/useCases/deleteOrder/DeleteOrderController";
import { EditOrderController } from "@modules/orders/useCases/editOrderUseCase/EditOrderController";
import { ListOrdersController } from "@modules/orders/useCases/listOrders/listOrdersController";
import { ListOrdersByUserController } from "@modules/orders/useCases/listOrdersByUser/listOrdersByUserController";
import { Router } from "express";

import { ensureAdmin } from "../middlewares/ensureAdmin";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

export const orderRoutes = Router();

const createOrderController = new CreateOrderController();
const createOrderAsAdminController = new CreateOrderAsAdminController();
const deleteOrderController = new DeleteOrderController();
const editOrderController = new EditOrderController();
const listOrdersController = new ListOrdersController();
const listOrdersByUserController = new ListOrdersByUserController();
const concludeOrderController = new ConcludeOrderController();

orderRoutes.post("/", ensureAuthenticated, createOrderController.handle);
orderRoutes.post(
  "/admin",
  ensureAuthenticated,
  ensureAdmin,
  createOrderAsAdminController.handle
);
orderRoutes.put("/:id", ensureAuthenticated, editOrderController.handle);
orderRoutes.delete("/:id", ensureAuthenticated, deleteOrderController.handle);
orderRoutes.get(
  "/list/all/:pageNumber/:pageSize",
  ensureAuthenticated,
  ensureAdmin,
  listOrdersController.handle
);
orderRoutes.get(
  "/user/list/:pageNumber/:pageSize",
  ensureAuthenticated,
  listOrdersByUserController.handle
);
orderRoutes.put(
  "/:id/conclude",
  ensureAuthenticated,
  ensureAdmin,
  concludeOrderController.handle
);
