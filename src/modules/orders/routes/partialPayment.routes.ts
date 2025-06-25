import { Router } from "express";

import { ensureAuthenticated } from "@shared/infra/http/middlewares/ensureAuthenticated";
import { ensureRole } from "@shared/infra/http/middlewares/ensureRole";

import { PartialPaymentController } from "../useCases/partialPayment/PartialPaymentController";

const partialPaymentRoutes = Router();

const partialPaymentController = new PartialPaymentController();

partialPaymentRoutes.post(
  "/",
  ensureAuthenticated,
  ensureRole(["ADMIN", "DELIVERY_MAN"]),
  partialPaymentController.handle
);

export { partialPaymentRoutes };
