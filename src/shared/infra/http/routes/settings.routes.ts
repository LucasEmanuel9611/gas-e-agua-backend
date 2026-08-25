import { GetPaymentSettingsController } from "@modules/paymentSettings/useCases/getPaymentSettings/GetPaymentSettingsController";
import { UpdatePaymentSettingsController } from "@modules/paymentSettings/useCases/updatePaymentSettings/UpdatePaymentSettingsController";
import { Router } from "express";

import { ensureAdmin } from "../middlewares/ensureAdmin";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

export const settingsRoutes = Router();

const getPaymentSettingsController = new GetPaymentSettingsController();
const updatePaymentSettingsController = new UpdatePaymentSettingsController();

settingsRoutes.get(
  "/payment",
  ensureAuthenticated,
  getPaymentSettingsController.handle
);

settingsRoutes.put(
  "/payment",
  ensureAuthenticated,
  ensureAdmin,
  updatePaymentSettingsController.handle
);
