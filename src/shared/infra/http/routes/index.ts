import { Router } from "express";

import { authenticateRoutes } from "./authenticate.routes";
// import { orderRoutes } from "./Orders.routes";
import { orderRoutes } from "./orders.routes";
import { usersRoutes } from "./users.routes";

const router = Router();

router.use(authenticateRoutes);
router.use("/users", usersRoutes);
router.use("/orders", orderRoutes);

export { router };
