import { Router } from "express";

import { authenticateRoutes } from "./authenticate.routes";
import { orderRoutes } from "./orders.routes";
import { stockRoutes } from "./stock.routes";
import { usersRoutes } from "./users.routes";

const router = Router();

router.use(authenticateRoutes);
router.use("/users", usersRoutes);
router.use("/orders", orderRoutes);
router.use("/stock", stockRoutes);

export { router };
