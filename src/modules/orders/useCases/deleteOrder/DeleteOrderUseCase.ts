import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { Order } from "@modules/orders/types";
import { inject, injectable } from "tsyringe";

interface IRequest {
  order_id: number;
}

@injectable()
export class DeleteOrderUseCase {
  constructor(
    @inject("OrdersRepository")
    private ordersRepository: IOrdersRepository
  ) {}

  async execute({ order_id }: IRequest): Promise<Order> {
    await this.ordersRepository.delete(order_id);

    return null;
  }
}
