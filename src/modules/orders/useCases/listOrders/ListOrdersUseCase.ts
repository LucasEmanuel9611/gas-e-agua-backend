import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { OrderProps } from "@modules/orders/types";
import { inject, injectable } from "tsyringe";

import { buildPaginatedResponse } from "@shared/types/pagination";

interface IRequest {
  page: number;
  limit: number;
  userId?: string;
  date?: Date;
  openAccounts?: boolean;
}

@injectable()
export class ListOrdersUseCase {
  constructor(
    @inject("OrdersRepository")
    private ordersRepository: IOrdersRepository
  ) {}

  async execute({ page, limit, userId, date, openAccounts }: IRequest) {
    const { items, total } = await this.ordersRepository.findAllPaginated({
      page,
      limit,
      userId,
      date,
      openAccounts,
    });

    return buildPaginatedResponse(items, total, page, limit);
  }

  async executeAll(): Promise<OrderProps[]> {
    const Orders = await this.ordersRepository.findAll();
    return Orders;
  }
}
