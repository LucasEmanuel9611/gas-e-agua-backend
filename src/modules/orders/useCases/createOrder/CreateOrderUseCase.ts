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
    if (!request.items || request.items.length === 0) {
      throw new AppError("Pelo menos um item deve ser fornecido");
    }

    const orderData: IOrderCreationData = {
      user_id: Number(request.user_id),
      items: request.items,
      addons: request.addons || [],
      status: request.status,
      payment_state: request.payment_state,
      total: request.total,
      interest_allowed: request.interest_allowed,
      overdue_amount: request.overdue_amount,
      overdue_description: request.overdue_description,
      due_date: request.due_date,
      customAddress: request?.customAddress,
    };

    return this.orderCreationService.createOrder(orderData);
  }
}
