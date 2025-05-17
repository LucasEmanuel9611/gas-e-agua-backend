import { Request, Response } from "express";
import { container } from "tsyringe";

import { validateSchema } from "@shared/utils/schema";

import { DeleteOrderUseCase } from "./DeleteOrderUseCase";
import { deleteOrderSchema } from "./schema";

export class DeleteOrderController {
  async handle(request: Request, response: Response) {
    const { id } = validateSchema(deleteOrderSchema, request.params);
    const deleteOrderUseCase = container.resolve(DeleteOrderUseCase);

    const order = await deleteOrderUseCase.execute({
      order_id: Number(id),
    });

    response.status(201).json(order);
  }
}
