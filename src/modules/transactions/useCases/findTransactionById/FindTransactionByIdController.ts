import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";

import { FindTransactionByIdUseCase } from "./FindTransactionByIdUseCase";

export class FindTransactionByIdController {
  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const { id } = request.params;
      const findTransactionByIdUseCase = container.resolve(
        FindTransactionByIdUseCase
      );
      const transaction = await findTransactionByIdUseCase.execute(Number(id));
      if (!transaction) {
        return response.status(404).json({ message: "Transaction not found" });
      }
      return response.json(transaction);
    } catch (err) {
      return handleControllerError(err, response);
    }
  }
}
