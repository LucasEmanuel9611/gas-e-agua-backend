import { OrderAccessPolicy } from "@modules/orders/policies/OrderAccessPolicy";
import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { OrderProps } from "@modules/orders/types";
import { Inject, Injectable } from "@nestjs/common";

import { AppError } from "@shared/errors/AppError";

interface IRequest {
  orderId: number;
  requestUserId: number;
  requestUserRole: string;
}

@Injectable()
export class GetOrderByIdUseCase {
  constructor(
    @Inject("OrdersRepository")
    private ordersRepository: IOrdersRepository
  ) {}

  async execute({
    orderId,
    requestUserId,
    requestUserRole,
  }: IRequest): Promise<OrderProps> {
    const order = await this.ordersRepository.findByIdWithDetails(orderId);

    if (!order) {
      throw new AppError({
        message: "Pedido não encontrado",
        statusCode: 404,
      });
    }

    const canViewOrder = OrderAccessPolicy.canViewOrder(
      { userId: requestUserId, role: requestUserRole },
      { ownerUserId: order.user_id }
    );

    if (!canViewOrder) {
      throw new AppError({
        message: "Acesso negado. Permissão insuficiente.",
        statusCode: 403,
      });
    }

    return order;
  }
}
