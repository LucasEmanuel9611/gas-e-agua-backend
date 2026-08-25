import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { Order } from "@modules/orders/types";
import { Inject, Injectable } from "@nestjs/common";

interface IRequest {
  order_id: number;
}

@Injectable()
export class DeleteOrderUseCase {
  constructor(
    @Inject("OrdersRepository")
    private ordersRepository: IOrdersRepository
  ) {}

  async execute({ order_id }: IRequest): Promise<Order> {
    await this.ordersRepository.delete(order_id);

    return null;
  }
}
