import { Response } from "express";
import { container } from "tsyringe";

import { ListOrdersUseCase } from "../listOrders/ListOrdersUseCase";

export class CountOrderController {
  async handle(_, response: Response): Promise<Response> {
    const listOrdersUseCase = container.resolve(ListOrdersUseCase);

    const allOrders = await listOrdersUseCase.execute();

    return response.json({
      quantity: allOrders.length,
    });
  }
}
