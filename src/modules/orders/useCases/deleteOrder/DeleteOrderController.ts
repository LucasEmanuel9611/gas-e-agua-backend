import { Request, Response } from "express";
import { container } from "tsyringe";

import { DeleteOrderUseCase } from "./DeleteOrderUseCase";

export class DeleteOrderController {
  async handle(request: Request, response: Response) {
    const deleteOrderUseCase = container.resolve(DeleteOrderUseCase);
    const { id } = request.params;

    const order = await deleteOrderUseCase.execute({
      order_id: id,
    });

    response.status(201).json(order);
  }
}
