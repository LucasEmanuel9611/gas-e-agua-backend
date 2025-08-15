import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";
import { validateSchema } from "@shared/utils/schema";

import { CreateOrderUseCase } from "../createOrder/CreateOrderUseCase";
import { createOrderAsAdminSchema } from "./schema";

export class CreateOrderAsAdminController {
  handle = async (request: Request, response: Response) => {
    try {
      const {
        user_id,
        gasAmount,
        waterAmount,
        waterWithBottle,
        gasWithBottle,
        status,
        payment_state,
        total,
        interest_allowed,
        overdue_amount,
        overdue_description,
        due_date,
      } = validateSchema(createOrderAsAdminSchema, request.body);

      const createOrderUseCase = container.resolve(CreateOrderUseCase);

      const order = await createOrderUseCase.execute({
        user_id,
        gasAmount,
        waterAmount,
        waterWithBottle,
        gasWithBottle,
        status,
        payment_state,
        total,
        interest_allowed,
        overdue_amount,
        overdue_description,
        due_date,
      });

      return response.status(201).json(order);
    } catch (err) {
      return handleControllerError(err, response);
    }
  };
}
