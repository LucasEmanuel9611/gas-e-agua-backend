import { GetDailyOrdersMetricsController } from "@modules/metrics/useCases/getDailyOrdersMetrics/GetDailyOrdersMetricsController";
import { GetStockMetricsController } from "@modules/metrics/useCases/getStockMetrics/GetStockMetricsController";
import { Router } from "express";

import { ensureAdmin } from "../middlewares/ensureAdmin";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

export const metricsRoutes = Router();

const getDailyOrdersMetricsController = new GetDailyOrdersMetricsController();
const getStockMetricsController = new GetStockMetricsController();

metricsRoutes.get(
  "/orders/daily",
  ensureAuthenticated,
  ensureAdmin,
  getDailyOrdersMetricsController.handle
);

metricsRoutes.get(
  "/stock",
  ensureAuthenticated,
  getStockMetricsController.handle
);
