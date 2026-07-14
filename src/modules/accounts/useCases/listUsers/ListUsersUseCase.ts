import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { AdminUserListItem, UserListSortOption } from "@modules/accounts/types";
import { inject, injectable } from "tsyringe";

import { UserMap } from "../../mapper/UserMapper";

interface IRequest {
  page?: number;
  limit?: number;
  search?: string;
  sort?: UserListSortOption;
}

interface IResponse {
  users: AdminUserListItem[];
  total: number;
  page: number;
  totalPages: number;
}

@injectable()
export class ListUsersUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository
  ) {}

  async execute({
    page = 1,
    limit = 10,
    search,
    sort = "highest_debt_first",
  }: IRequest): Promise<IResponse> {
    const offset = (page - 1) * limit;

    const { users, total } = await this.usersRepository.findAll({
      page,
      limit,
      offset,
      search,
      sort,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      users: users.map((user) => UserMap.toAdminListItem(user)),
      total,
      page,
      totalPages,
    };
  }
}
