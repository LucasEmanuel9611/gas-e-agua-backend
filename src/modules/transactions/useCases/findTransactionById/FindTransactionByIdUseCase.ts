import { ITransactionsRepository } from "@modules/transactions/repositories/ITransactionsRepository";
import { ITransaction } from "@modules/transactions/types/types";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class FindTransactionByIdUseCase {
  constructor(
    @Inject("TransactionsRepository")
    private transactionsRepository: ITransactionsRepository
  ) {}

  async execute(id: number): Promise<ITransaction | null> {
    return this.transactionsRepository.findById(id);
  }
}
