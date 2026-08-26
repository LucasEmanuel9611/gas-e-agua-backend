import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class UpdateOverdueOrdersUseCase {
  constructor(
    @Inject("OrdersRepository")
    private ordersRepository: IOrdersRepository
  ) {}

  async execute(): Promise<number> {
    const count = await this.ordersRepository.updateOverdueOrders();
    return count;
  }
}
