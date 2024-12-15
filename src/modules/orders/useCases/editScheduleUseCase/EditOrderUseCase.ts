import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { Order } from "@modules/orders/types";
import { inject, injectable } from "tsyringe";

interface IRequest {
  order_id: string;
  date: string;
}

@injectable()
export class EditOrderUseCase {
  constructor(
    @inject("OrdersRepository")
    private ordersRepository: IOrdersRepository
  ) {}

  async execute({ order_id, date }: IRequest): Promise<Order> {
    const updatedOrder = await this.ordersRepository.updateDate(
      Number(order_id),
      date
    );

    return updatedOrder;
  }
}
