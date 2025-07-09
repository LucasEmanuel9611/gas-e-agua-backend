import { ITransactionsRepository } from "@modules/transactions/repositories/ITransactionsRepository";
import { ITransaction } from "@modules/transactions/types/types";
import { inject, injectable } from "tsyringe";

@injectable()
export class FindTransactionByIdUseCase {
  constructor(
    @inject("TransactionsRepository")
    private transactionsRepository: ITransactionsRepository
  ) {}

  async execute(id: number): Promise<ITransaction | null> {
    return this.transactionsRepository.findById(id);
  }
}
