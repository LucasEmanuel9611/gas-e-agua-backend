import { CreateAddonController } from "@modules/addons/useCases/createAddon/CreateAddonController";
import { FindAddonsController } from "@modules/addons/useCases/findAddons/FindAddonsController";
import { UpdateAddonController } from "@modules/addons/useCases/updateAddon/UpdateAddonController";
import { Router } from "express";

import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

export const addonsRoutes = Router();

const createAddonController = new CreateAddonController();
const updateAddonController = new UpdateAddonController();
const findAddonsController = new FindAddonsController();

addonsRoutes.post("/", ensureAuthenticated, createAddonController.handle);
addonsRoutes.put("/:id", ensureAuthenticated, updateAddonController.handle);
addonsRoutes.get("/", ensureAuthenticated, findAddonsController.handle);
