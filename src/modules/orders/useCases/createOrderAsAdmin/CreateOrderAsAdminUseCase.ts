import { OrderProps } from "@modules/orders/types";
import { inject, injectable } from "tsyringe";

import {
  IOrderCreationData,
  OrderCreationService,
} from "../../services/OrderCreationService";

interface IRequest {
  user_id: number;
  gasAmount: number;
  waterAmount: number;
  waterWithBottle?: boolean;
  gasWithBottle?: boolean;
  status?: "INICIADO" | "PENDENTE" | "FINALIZADO";
  payment_state?: "PENDENTE" | "PAGO" | "VENCIDO" | "PARCIALMENTE_PAGO";
  total?: number;
  interest_allowed?: boolean;
  overdue_amount?: number;
  overdue_description?: string;
  due_date?: Date;
}

@injectable()
export class CreateOrderAsAdminUseCase {
  constructor(
    @inject("OrderCreationService")
    private orderCreationService: OrderCreationService
  ) {}

  async execute(request: IRequest): Promise<OrderProps> {
    const orderData: IOrderCreationData = {
      user_id: request.user_id,
      gasAmount: request.gasAmount,
      waterAmount: request.waterAmount,
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
