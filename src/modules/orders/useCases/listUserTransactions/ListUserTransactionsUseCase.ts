import { ITransactionsRepository } from "@modules/transactions/repositories/ITransactionsRepository";
import { TransactionSortOption } from "@modules/transactions/types/types";
import { inject, injectable } from "tsyringe";

import { buildPaginatedResponse } from "@shared/types/pagination";

interface IRequest {
  userId: number;
  page?: number;
  limit?: number;
  sort?: TransactionSortOption;
  orderId?: number;
}

@injectable()
export class ListUserTransactionsUseCase {
  constructor(
    @inject("TransactionsRepository")
    private transactionsRepository: ITransactionsRepository
  ) {}

  async execute({
    userId,
    page = 1,
    limit = 20,
    sort = "date_desc",
    orderId,
  }: IRequest) {
    const { items, total } =
      await this.transactionsRepository.findByUserIdPaginated({
        userId,
        page,
        limit,
        sort,
        orderId,
      });

    return buildPaginatedResponse(items, total, page, limit);
  }
}
