import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { OrderProps, OrderStatusProps } from "@modules/orders/types";
import { Inject, Injectable } from "@nestjs/common";

interface IRequest {
  order_id: string;
  status: OrderStatusProps;
}

@Injectable()
export class ConcludeOrderUseCase {
  constructor(
    @Inject("OrdersRepository")
    private ordersRepository: IOrdersRepository
  ) {}

  async execute({ order_id, status }: IRequest): Promise<OrderProps> {
    const updatedOrder = await this.ordersRepository.updateById(
      Number(order_id),
      { status }
    );

    return updatedOrder;
  }
}
