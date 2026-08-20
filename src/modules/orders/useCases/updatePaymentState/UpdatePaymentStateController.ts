import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";
import { validateSchema } from "@shared/utils/schema";

import { updatePaymentStateSchema } from "./schema";
import { UpdatePaymentStateUseCase } from "./UpdatePaymentStateUseCase";

export class UpdatePaymentStateController {
  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const { order_id, payment_state, remaining_balance, notes } =
        validateSchema(updatePaymentStateSchema, {
          order_id: request.params.id,
          payment_state: request.body.payment_state,
          remaining_balance: request.body.remaining_balance,
          notes: request.body.notes,
        });

      const updatePaymentStateUseCase = container.resolve(
        UpdatePaymentStateUseCase
      );
      const order = await updatePaymentStateUseCase.execute({
        order_id,
        payment_state,
        remaining_balance,
        notes,
      });

      return response.json(order);
    } catch (error) {
      return handleControllerError(error, response);
    }
  }
}
