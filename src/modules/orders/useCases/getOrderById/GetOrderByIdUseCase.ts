import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { OrderProps } from "@modules/orders/types";
import { inject, injectable } from "tsyringe";

import { AppError } from "@shared/errors/AppError";

interface IRequest {
  orderId: number;
  requestUserId: number;
  requestUserRole: string;
}

@injectable()
export class GetOrderByIdUseCase {
  constructor(
    @inject("OrdersRepository")
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

    const isAdmin = requestUserRole === "ADMIN";

    if (!isAdmin && order.user_id !== requestUserId) {
      throw new AppError({
        message: "Acesso negado. Permissão insuficiente.",
        statusCode: 403,
      });
    }

    return order;
  }
}
