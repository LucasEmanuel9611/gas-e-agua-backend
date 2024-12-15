import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { Order, OrderStatusProps } from "@modules/orders/types";
import { inject, injectable } from "tsyringe";

interface IRequest {
  order_id: string;
  status: OrderStatusProps;
}

@injectable()
export class ConcludeOrderUseCase {
  constructor(
    @inject("OrdersRepository")
    private ordersRepository: IOrdersRepository
  ) {}

  async execute({ order_id, status }: IRequest): Promise<Order> {
    const updatedOrder = await this.ordersRepository.updateStatus(
      Number(order_id),
      status
    );

    return updatedOrder;
  }
}
