import { updateStockItemSchema } from "@modules/stock/schema";
import { Request, Response } from "express";
import { container } from "tsyringe";

import { validateSchema } from "@shared/utils/schema";

import { UpdateStockUseCase } from "./UpdateStockUseCase";

export class UpdateStockController {
  async handle(req: Request, res: Response) {
    const { quantity, name, value } = validateSchema(
      updateStockItemSchema,
      req.body
    );
    const { id } = req.params;

    const updateStockUseCase = container.resolve(UpdateStockUseCase);

    const updatedItem = await updateStockUseCase.execute({
      id: Number(id),
      newData: { quantity, name, value },
    });

    return res.status(201).send(updatedItem);
  }
}
