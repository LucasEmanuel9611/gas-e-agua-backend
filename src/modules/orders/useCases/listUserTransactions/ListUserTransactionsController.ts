import { ListUserTransactionsUseCase } from "@modules/orders/useCases/listUserTransactions/ListUserTransactionsUseCase";
import { Request, Response } from "express";
import { container } from "tsyringe";

import { validatePaginationParams } from "@shared/types/pagination";
import { handleControllerError } from "@shared/utils/controller";

export class ListUserTransactionsController {
  handle = async (request: Request, response: Response) => {
    try {
      const { userId } = request.params;
      const { sort = "date_desc", order_id } = request.query;
      const { page, limit } = validatePaginationParams(
        request.query.page as string,
        request.query.limit as string
      );

      const listUserTransactionsUseCase = container.resolve(
        ListUserTransactionsUseCase
      );

      const result = await listUserTransactionsUseCase.execute({
        userId: Number(userId),
        page,
        limit,
        sort: sort as "date_desc" | "date_asc" | "amount_desc" | "amount_asc",
        orderId: order_id ? Number(order_id) : undefined,
      });

      return response.json(result);
    } catch (error) {
      return handleControllerError(error, response);
    }
  };
}
