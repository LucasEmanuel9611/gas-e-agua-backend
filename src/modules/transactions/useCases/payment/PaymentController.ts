import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";
import { validateSchema } from "@shared/utils/schema";

import { PaymentUseCase } from "./PaymentUseCase";
import { partialPaymentSchema } from "./schema";

export class PaymentController {
  handle = async (request: Request, response: Response) => {
    try {
      const { order_id, amount_paid, payment_method, notes } = validateSchema(
        partialPaymentSchema,
        request.body
      );

      const paymentUseCase = container.resolve(PaymentUseCase);

      const updatedOrder = await paymentUseCase.execute({
        order_id,
        amount_paid,
        payment_method,
        notes,
      });
      console.log("TESTE 4");

      return response.status(200).json({
        message: "Pagamento registrado com sucesso",
        order: updatedOrder,
      });
    } catch (err) {
      return handleControllerError(err, response);
    }
  };
}
