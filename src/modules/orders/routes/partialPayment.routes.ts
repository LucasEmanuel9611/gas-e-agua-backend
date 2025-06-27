import { Router } from "express";

import { ensureAuthenticated } from "@shared/infra/http/middlewares/ensureAuthenticated";
import { ensureRole } from "@shared/infra/http/middlewares/ensureRole";

import { PaymentController } from "../useCases/payment/PaymentController";

const paymentRoutes = Router();

const paymentController = new PaymentController();

paymentRoutes.post(
  "/",
  ensureAuthenticated,
  ensureRole(["ADMIN", "DELIVERY_MAN"]),
  paymentController.handle
);

export { paymentRoutes };
