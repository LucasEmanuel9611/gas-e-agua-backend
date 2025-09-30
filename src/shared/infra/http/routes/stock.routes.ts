import { CreateStockItemController } from "@modules/stock/useCases/createItem/CreateStockItemController";
import { GetStockController } from "@modules/stock/useCases/getStock/GetStockController";
import { UpdateStockController } from "@modules/stock/useCases/updateStock/UpdateStockController";
import { Router } from "express";

import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

export const stockRoutes = Router();

const createStockItemController = new CreateStockItemController();
const updateStockController = new UpdateStockController();
const getStockController = new GetStockController();

stockRoutes.post("/", ensureAuthenticated, createStockItemController.handle);
stockRoutes.put("/:id", ensureAuthenticated, updateStockController.handle);
stockRoutes.get("/", ensureAuthenticated, getStockController.handle);
