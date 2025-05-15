/* eslint-disable radix */
import { Request, Response } from "express";
import { container } from "tsyringe";

import { ListOrdersUseCase } from "./ListOrdersUseCase";

export class ListOrdersController {
  async handle(request: Request, response: Response): Promise<Response> {
    const listOrdersUseCase = container.resolve(ListOrdersUseCase);

    const { pageNumber, pageSize } = request.params;
    const pageInt = parseInt(pageNumber);
    const startIndex = pageInt * parseInt(pageSize);
    const endIndex = startIndex + parseInt(pageSize);

    const allOrders = await listOrdersUseCase.execute();

    const orders = allOrders.slice(startIndex, endIndex);

    // add have more Orders
    return response.json({
      page_number: pageInt,
      total_items_count: allOrders.length,
      items: orders,
    });
  }
}
