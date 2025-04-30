// useCases/updateOverdueOrders/UpdateOverdueOrdersUseCase.ts
import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { inject, injectable } from "tsyringe";

@injectable()
export class UpdateOverdueOrdersUseCase {
  constructor(
    @inject("OrdersRepository")
    private ordersRepository: IOrdersRepository
  ) {}

  async execute(): Promise<number> {
    const count = await this.ordersRepository.updateOverdueOrders();
    return count;
  }
}
