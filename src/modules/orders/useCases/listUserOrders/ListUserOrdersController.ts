import { ListUserOrdersUseCase } from "@modules/orders/useCases/listUserOrders/ListUserOrdersUseCase";
import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";

export class ListUserOrdersController {
  handle = async (request: Request, response: Response) => {
    try {
      const { userId } = request.params;
      const { sort = "unpaid_first" } = request.query;

      const listUserOrdersUseCase = container.resolve(ListUserOrdersUseCase);

      const accounts = await listUserOrdersUseCase.execute({
        userId,
        sort: sort as
          | "unpaid_first"
          | "date_desc"
          | "date_asc"
          | "balance_desc"
          | "balance_asc",
      });

      return response.json(accounts);
    } catch (error) {
      return handleControllerError(error, response);
    }
  };
}
