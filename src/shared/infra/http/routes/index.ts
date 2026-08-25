import { Router } from "express";

import { metricsRoutes } from "./metrics.routes";
import { notificationsRoutes } from "./notifications.routes";
import { orderRoutes } from "./orders.routes";
import { transactionsRoutes } from "./transactions.routes";
import { usersRoutes } from "./users.routes";

const router = Router();

router.use("/users", usersRoutes);
router.use("/orders", orderRoutes);
router.use("/transactions", transactionsRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/metrics", metricsRoutes);

export { router };
