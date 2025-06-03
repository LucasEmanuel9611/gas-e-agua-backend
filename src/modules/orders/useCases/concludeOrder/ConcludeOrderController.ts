import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";
import { validateSchema } from "@shared/utils/schema";

import { ConcludeOrderUseCase } from "./ConcludeOrderUseCase";
import { concludeOrderSchema } from "./schemas";

export class ConcludeOrderController {
  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const { order_id, status } = validateSchema(concludeOrderSchema, {
        order_id: request.params.id,
        status: request.body.status,
      });

      const concludeOrderUseCase = container.resolve(ConcludeOrderUseCase);
      const order = await concludeOrderUseCase.execute({ order_id, status });

      return response.json(order);
    } catch (error) {
      return handleControllerError(error, response);
    }
  }
}
