import { Response } from "express";
import "reflect-metadata";
import { container } from "tsyringe";

import { GetStockUseCase } from "./GetStockUseCase";

export class GetStockController {
  async handle(_, res: Response) {
    const getStockItemsUseCase = container.resolve(GetStockUseCase);

    const allStockItems = await getStockItemsUseCase.execute();

    return res.status(201).send({ items: allStockItems ?? [] });
  }
}
