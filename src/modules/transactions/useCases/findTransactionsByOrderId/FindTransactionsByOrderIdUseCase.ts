import { ITransactionsRepository } from "@modules/transactions/repositories/ITransactionsRepository";
import { ITransaction } from "@modules/transactions/types/types";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class FindTransactionsByOrderIdUseCase {
  constructor(
    @Inject("TransactionsRepository")
    private transactionsRepository: ITransactionsRepository
  ) {}

  async execute(order_id: number): Promise<ITransaction[]> {
    return this.transactionsRepository.findByOrderId(order_id);
  }
}
