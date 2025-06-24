/* eslint-disable radix */
import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";
import { validateSchema } from "@shared/utils/schema";

import { ListOrdersUseCase } from "./ListOrdersUseCase";
import { listOrdersSchema } from "./schema";

export class ListOrdersController {
  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const listOrdersUseCase = container.resolve(ListOrdersUseCase);

      const { pageNumber, pageSize } = validateSchema(
        listOrdersSchema,
        request.params
      );
      const startIndex = pageNumber * pageSize;
      const endIndex = startIndex + pageSize;

      const allOrders = await listOrdersUseCase.execute();

      const orders = allOrders.slice(startIndex, endIndex);

      // add have more Orders
      return response.json({
        page_number: pageNumber,
        total_items_count: allOrders.length,
        items: orders,
      });
    } catch (error) {
      return handleControllerError(error, response);
    }
  }
}
