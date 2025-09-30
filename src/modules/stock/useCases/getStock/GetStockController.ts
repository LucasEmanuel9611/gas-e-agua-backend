import { Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";

import { GetStockUseCase } from "./GetStockUseCase";

export class GetStockController {
  async handle(_, res: Response) {
    try {
      const getStockItemsUseCase = container.resolve(GetStockUseCase);

      const allStockItems = await getStockItemsUseCase.execute();

      return res.status(201).send({ items: allStockItems ?? [] });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }
}
