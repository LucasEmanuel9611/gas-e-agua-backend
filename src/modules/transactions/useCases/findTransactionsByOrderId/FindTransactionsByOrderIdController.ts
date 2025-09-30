import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";

import { FindTransactionsByOrderIdUseCase } from "./FindTransactionsByOrderIdUseCase";

export class FindTransactionsByOrderIdController {
  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const { order_id } = request.params;
      const findTransactionsByOrderIdUseCase = container.resolve(
        FindTransactionsByOrderIdUseCase
      );
      const transactions = await findTransactionsByOrderIdUseCase.execute(
        Number(order_id)
      );
      return response.json(transactions);
    } catch (err) {
      return handleControllerError(err, response);
    }
  }
}
