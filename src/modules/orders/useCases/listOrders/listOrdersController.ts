import { ListOrdersUseCase } from "@modules/orders/useCases/listOrders/ListOrdersUseCase";
import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";
import { validateSchema } from "@shared/utils/schema";

import { listOrdersSchema } from "./schema";

export class ListOrdersController {
  handle = async (request: Request, response: Response): Promise<Response> => {
    try {
      const { id: userId } = request.user;
      const { scope, page, limit, date } = validateSchema(
        listOrdersSchema,
        request.query
      );

      const listOrdersUseCase = container.resolve(ListOrdersUseCase);

      const parsedDate = date ? new Date(date) : undefined;

      const result = await listOrdersUseCase.execute({
        page: page + 1,
        limit,
        userId: scope === "me" ? userId : undefined,
        date: parsedDate,
      });

      return response.json({
        items: result.items,
        pagination: {
          ...result.pagination,
          page,
        },
      });
    } catch (error) {
      return handleControllerError(error, response);
    }
  };
}
