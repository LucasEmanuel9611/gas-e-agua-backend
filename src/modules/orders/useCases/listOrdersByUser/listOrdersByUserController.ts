/* eslint-disable radix */
import { Request, Response } from "express";
import { container } from "tsyringe";

import { ListOrdersByUserUseCase } from "./ListOrdersByUserUseCase";

export class ListOrdersByUserController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { id } = request.user;

    const { pageNumber, pageSize } = request.params;
    const pageInt = parseInt(pageNumber);
    const startIndex = pageInt * parseInt(pageSize);
    const endIndex = startIndex + parseInt(pageSize);

    const listOrdersByUserUseCase = container.resolve(ListOrdersByUserUseCase);
    const allUserOrders = await listOrdersByUserUseCase.execute(id);

    const orders = allUserOrders.slice(startIndex, endIndex);

    // add have more Orders
    return response.json({
      page_number: pageInt,
      total_items_count: allUserOrders.length,
      items: orders,
    });
  }
}
