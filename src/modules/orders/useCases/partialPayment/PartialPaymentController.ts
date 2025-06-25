import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";
import { validateSchema } from "@shared/utils/schema";

import { PartialPaymentUseCase } from "./PartialPaymentUseCase";
import { partialPaymentSchema } from "./schema";

export class PartialPaymentController {
  handle = async (request: Request, response: Response) => {
    try {
      const { order_id, amount_paid, payment_method, notes } = validateSchema(
        partialPaymentSchema,
        request.body
      );

      const partialPaymentUseCase = container.resolve(PartialPaymentUseCase);

      const updatedOrder = await partialPaymentUseCase.execute({
        order_id,
        amount_paid,
        payment_method,
        notes,
      });

      return response.status(200).json({
        message: "Pagamento registrado com sucesso",
        order: updatedOrder,
      });
    } catch (err) {
      return handleControllerError(err, response);
    }
  };
}
