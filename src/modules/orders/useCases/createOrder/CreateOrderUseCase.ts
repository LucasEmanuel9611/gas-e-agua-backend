/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
import { OrderProps } from "@modules/orders/types";
import { inject, injectable } from "tsyringe";

import {
  IOrderCreationData,
  OrderCreationService,
} from "../../services/OrderCreationService";

interface IRequest {
  user_id: string;
  gasAmount: number;
  waterAmount: number;
  waterWithBottle?: boolean;
  gasWithBottle?: boolean;
}

@injectable()
export class CreateOrderUseCase {
  constructor(
    @inject("OrderCreationService")
    private orderCreationService: OrderCreationService
  ) {}

  async execute({
    user_id,
    gasAmount,
    waterAmount,
    waterWithBottle = false,
    gasWithBottle = false,
  }: IRequest): Promise<OrderProps> {
    const orderData: IOrderCreationData = {
      user_id: Number(user_id),
      gasAmount,
      waterAmount,
      waterWithBottle,
      gasWithBottle,
      status: "PENDENTE",
      payment_state: "PENDENTE",
      interest_allowed: true,
    };

    return this.orderCreationService.createOrder(orderData);
  }
}
