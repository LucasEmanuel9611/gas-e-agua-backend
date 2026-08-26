import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { OrderProps } from "@modules/orders/types";
import { Inject, Injectable } from "@nestjs/common";

import {
  AccountSortOption,
  sortUserAccounts,
} from "../../utils/sortUserAccounts";

interface IRequest {
  userId: string;
  sort?: AccountSortOption;
}

@Injectable()
export class ListUserOrdersUseCase {
  constructor(
    @Inject("OrdersRepository")
    private ordersRepository: IOrdersRepository
  ) {}

  async execute({
    userId,
    sort = "unpaid_first",
  }: IRequest): Promise<OrderProps[]> {
    const userAccounts = await this.ordersRepository.findByUser(userId);

    return sortUserAccounts(userAccounts, sort);
  }
}
