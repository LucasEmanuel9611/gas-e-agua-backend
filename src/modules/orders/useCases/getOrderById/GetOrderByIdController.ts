import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";
import { validateSchema } from "@shared/utils/schema";

import { GetOrderByIdUseCase } from "./GetOrderByIdUseCase";
import { getOrderByIdSchema } from "./schemas";

export class GetOrderByIdController {
  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const { order_id } = validateSchema(getOrderByIdSchema, {
        order_id: request.params.id,
      });

      const { id: userId, role } = request.user;

      const getOrderByIdUseCase = container.resolve(GetOrderByIdUseCase);

      const order = await getOrderByIdUseCase.execute({
        orderId: order_id,
        requestUserId: Number(userId),
        requestUserRole: role,
      });

      return response.json(order);
    } catch (error) {
      return handleControllerError(error, response);
    }
  }
}
