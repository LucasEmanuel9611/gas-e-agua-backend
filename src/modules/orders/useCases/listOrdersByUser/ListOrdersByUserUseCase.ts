import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { Order } from "@modules/orders/types";
import { inject, injectable } from "tsyringe";

@injectable()
export class ListOrdersByUserUseCase {
  constructor(
    @inject("OrdersRepository")
    private ordersRepository: IOrdersRepository
  ) {}

  async execute(user_id: string): Promise<Order[]> {
    const ordersByUser = await this.ordersRepository.findByUser(user_id);

    return ordersByUser;
  }
}
