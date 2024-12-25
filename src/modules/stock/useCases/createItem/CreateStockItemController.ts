import { createStockItemSchema } from "@modules/stock/schema";
import { Request, Response } from "express";
import "reflect-metadata";
import { container } from "tsyringe";

import { validateSchema } from "@shared/utils/schema";

import { CreateStockItemUseCase } from "./CreateStockItemUseCase";

export class CreateStockItemController {
  async handle(req: Request, res: Response) {
    const { quantity, name, value } = validateSchema(
      createStockItemSchema,
      req.body
    );

    const createStockItemUseCase = container.resolve(CreateStockItemUseCase);

    await createStockItemUseCase.execute({ quantity, name, value });

    return res.status(201).send({ quantity, name, value });
  }
}
