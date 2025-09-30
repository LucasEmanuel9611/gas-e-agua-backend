import { createStockItemSchema } from "@modules/stock/useCases/createItem/schema";
import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";
import { validateSchema } from "@shared/utils/schema";

import { CreateStockItemUseCase } from "./CreateStockItemUseCase";

export class CreateStockItemController {
  async handle(req: Request, res: Response) {
    try {
      const { quantity, name, value, type } = validateSchema(
        createStockItemSchema,
        req.body
      );

      const createStockItemUseCase = container.resolve(CreateStockItemUseCase);

      await createStockItemUseCase.execute({ quantity, name, value, type });

      return res.status(201).send({ quantity, name, value, type });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }
}
