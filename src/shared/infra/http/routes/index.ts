import { Router } from "express";

import { notificationsRoutes } from "./notifications.routes";
import { orderRoutes } from "./orders.routes";
import { usersRoutes } from "./users.routes";

const router = Router();

router.use("/users", usersRoutes);
router.use("/orders", orderRoutes);
router.use("/notifications", notificationsRoutes);

export { router };
