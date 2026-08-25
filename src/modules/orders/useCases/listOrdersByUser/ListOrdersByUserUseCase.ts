import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { OrderProps } from "@modules/orders/types";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class ListOrdersByUserUseCase {
  constructor(
    @Inject("OrdersRepository")
    private ordersRepository: IOrdersRepository
  ) {}

  async execute(user_id: string): Promise<OrderProps[]> {
    const ordersByUser = await this.ordersRepository.findByUser(user_id);

    return ordersByUser;
  }
}
