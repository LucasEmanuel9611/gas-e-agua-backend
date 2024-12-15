import { Request, Response } from "express";
import { container } from "tsyringe";

import { ConcludeOrderUseCase } from "./ConcludeOrderUseCase";

export class ConcludeOrderController {
  async handle(request: Request, response: Response) {
    const adminManageOrderUseCase = container.resolve(ConcludeOrderUseCase);
    const { id } = request.params;

    const order = await adminManageOrderUseCase.execute({
      order_id: id,
      status: "FINALIZADO",
    });

    response.status(201).json(order);
  }
}
