import { ITransactionsRepository } from "@modules/orders/repositories/ITransactionsRepository";
import { ITransaction } from "@modules/orders/types";
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
