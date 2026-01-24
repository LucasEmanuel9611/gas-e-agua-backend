import { Router } from "express";

import { addonsRoutes } from "./addons.routes";
import { authenticateRoutes } from "./authenticate.routes";
import { notificationsRoutes } from "./notifications.routes";
import { orderRoutes } from "./orders.routes";
import { stockRoutes } from "./stock.routes";
import { transactionsRoutes } from "./transactions.routes";
import { usersRoutes } from "./users.routes";

const router = Router();

router.use(authenticateRoutes);
router.use("/users", usersRoutes);
router.use("/orders", orderRoutes);
router.use("/stock", stockRoutes);
router.use("/addons", addonsRoutes);
router.use("/transactions", transactionsRoutes);
router.use("/notifications", notificationsRoutes);

export { router };
