import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { OrderProps } from "@modules/orders/types";
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

  async execute({ order_id, date }: IRequest): Promise<OrderProps> {
    const updatedOrder = await this.ordersRepository.updateById(
      Number(order_id),
      { updated_at: date }
    );

    return updatedOrder;
  }
}
