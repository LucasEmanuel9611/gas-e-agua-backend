import { ITransactionsRepository } from "@modules/orders/repositories/ITransactionsRepository";
import { ITransaction } from "@modules/orders/types";
import { inject, injectable } from "tsyringe";

@injectable()
export class FindTransactionsByOrderIdUseCase {
  constructor(
    @inject("TransactionsRepository")
    private transactionsRepository: ITransactionsRepository
  ) {}

  async execute(order_id: number): Promise<ITransaction[]> {
    return this.transactionsRepository.findByOrderId(order_id);
  }
}
