import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { OrderProps } from "@modules/orders/types";
import { inject, injectable } from "tsyringe";

import {
  AccountSortOption,
  sortUserAccounts,
} from "../../utils/sortUserAccounts";

interface IRequest {
  userId: string;
  sort?: AccountSortOption;
}

@injectable()
export class ListUserOrdersUseCase {
  constructor(
    @inject("OrdersRepository")
    private ordersRepository: IOrdersRepository
  ) {}

  async execute({
    userId,
    sort = "open_first",
  }: IRequest): Promise<OrderProps[]> {
    const userAccounts = await this.ordersRepository.findByUser(userId);

    return sortUserAccounts(userAccounts, sort);
  }
}
