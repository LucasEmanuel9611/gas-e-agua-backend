import { OrderProps } from "@modules/orders/types";
import { inject, injectable } from "tsyringe";

import { AppError } from "@shared/errors/AppError";

import {
  IOrderCreationData,
  IOrderCreationService,
} from "../../services/IOrderCreationService";

@injectable()
export class CreateOrderUseCase {
  constructor(
    @inject("OrderCreationService")
    private orderCreationService: IOrderCreationService
  ) {}

  async execute(request: IOrderCreationData): Promise<OrderProps> {
    if (!request.gasAmount && !request.waterAmount) {
      throw new AppError(
        "Pelo menos um dos valores (Gás ou Água) deve ser fornecido"
      );
    }

    const orderData: IOrderCreationData = {
      user_id: Number(request.user_id),
      gasAmount: request.gasAmount || 0,
      waterAmount: request.waterAmount || 0,
      waterWithBottle: request.waterWithBottle,
      gasWithBottle: request.gasWithBottle,
      status: request.status,
      payment_state: request.payment_state,
      total: request.total,
      interest_allowed: request.interest_allowed,
      overdue_amount: request.overdue_amount,
      overdue_description: request.overdue_description,
      due_date: request.due_date,
    };

    return this.orderCreationService.createOrder(orderData);
  }
}
