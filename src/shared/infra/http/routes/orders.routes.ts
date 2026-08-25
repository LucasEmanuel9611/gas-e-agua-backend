import { OrderAccessPolicy } from "@modules/orders/policies/OrderAccessPolicy";
import { ConcludeOrderController } from "@modules/orders/useCases/concludeOrder/ConcludeOrderController";
import { CountOrdersController } from "@modules/orders/useCases/countOrder/CountOrdersController";
import { CreateOrderController } from "@modules/orders/useCases/createOrder/CreateOrderController";
import { DeleteOrderController } from "@modules/orders/useCases/deleteOrder/DeleteOrderController";
import { EditOrderController } from "@modules/orders/useCases/editOrderUseCase/EditOrderController";
import { GetAdminHomeDashboardController } from "@modules/orders/useCases/getAdminHomeDashboard/GetAdminHomeDashboardController";
import { GetDeliveryDaySummaryController } from "@modules/orders/useCases/getDeliveryDaySummary/GetDeliveryDaySummaryController";
import { GetOrderByIdController } from "@modules/orders/useCases/getOrderById/GetOrderByIdController";
import { ListOrdersController } from "@modules/orders/useCases/listOrders/listOrdersController";
import { UpdatePaymentStateController } from "@modules/orders/useCases/updatePaymentState/UpdatePaymentStateController";
import { Router } from "express";

import { checkRole } from "../middlewares/checkRole";
import { ensureAdmin } from "../middlewares/ensureAdmin";
import { ensureAdminForAllScope } from "../middlewares/ensureAdminForAllScope";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

export const orderRoutes = Router();

const createOrderController = new CreateOrderController();
const deleteOrderController = new DeleteOrderController();
const editOrderController = new EditOrderController();
const listOrdersController = new ListOrdersController();
const countOrderController = new CountOrdersController();
const getAdminHomeDashboardController = new GetAdminHomeDashboardController();
const getDeliveryDaySummaryController = new GetDeliveryDaySummaryController();
const getOrderByIdController = new GetOrderByIdController();
const concludeOrderController = new ConcludeOrderController();
const updatePaymentStateController = new UpdatePaymentStateController();

orderRoutes.post("/", ensureAuthenticated, createOrderController.handle);

orderRoutes.put(
  "/:id",
  ensureAuthenticated,
  checkRole(OrderAccessPolicy.getRolesThatCanEditOrderItems()),
  editOrderController.handle
);
orderRoutes.delete(
  "/:id",
  ensureAuthenticated,
  checkRole(OrderAccessPolicy.getRolesThatCanDeleteOrder()),
  deleteOrderController.handle
);
orderRoutes.get(
  "/",
  ensureAuthenticated,
  ensureAdminForAllScope,
  listOrdersController.handle
);
orderRoutes.get("/count", ensureAdmin, countOrderController.handle);
orderRoutes.get(
  "/dashboard",
  ensureAuthenticated,
  ensureAdmin,
  getAdminHomeDashboardController.handle
);
orderRoutes.get(
  "/delivery/summary",
  ensureAuthenticated,
  checkRole(["DELIVERY_MAN"]),
  getDeliveryDaySummaryController.handle
);
orderRoutes.get("/:id", ensureAuthenticated, getOrderByIdController.handle);

orderRoutes.put(
  "/:id/conclude",
  ensureAuthenticated,
  checkRole(OrderAccessPolicy.getRolesThatCanUpdateOrderStatus()),
  concludeOrderController.handle
);

orderRoutes.put(
  "/:id/payment-state",
  ensureAuthenticated,
  ensureAdmin,
  updatePaymentStateController.handle
);
