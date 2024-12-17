import { CreateOrderController } from "@modules/orders/useCases/createOrder/CreateOrderController";
import { Router } from "express";

import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

export const orderRoutes = Router();

const createOrderController = new CreateOrderController();

orderRoutes.post("/", ensureAuthenticated, createOrderController.handle);
