import { CreateOrderController } from "@modules/orders/useCases/createOrder/CreateOrderController";
import { DeleteOrderController } from "@modules/orders/useCases/deleteOrder/DeleteOrderController";
import { ListOrdersController } from "@modules/orders/useCases/listOrders/listOrdersController";
import { ListOrdersByUserController } from "@modules/orders/useCases/listOrdersByUser/listOrdersByUserController";
import { Router } from "express";

import { ensureAdmin } from "../middlewares/ensureAdmin";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

export const orderRoutes = Router();

const createOrderController = new CreateOrderController();
const deleteOrderController = new DeleteOrderController();
const listOrdersController = new ListOrdersController();
const listOrdersByUserController = new ListOrdersByUserController();

orderRoutes.post("/", ensureAuthenticated, createOrderController.handle);
orderRoutes.delete("/:id", ensureAuthenticated, deleteOrderController.handle);
orderRoutes.get(
  "/list/all",
  ensureAuthenticated,
  ensureAdmin,
  listOrdersController.handle
);
orderRoutes.get(
  "/user/list",
  ensureAuthenticated,
  listOrdersByUserController.handle
);
