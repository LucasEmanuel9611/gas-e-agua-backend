import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { UserDates } from "@modules/accounts/types";
import { inject, injectable } from "tsyringe";

interface IRequest {
  page?: number;
  limit?: number;
  search?: string;
}

interface IResponse {
  users: UserDates[];
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
  }: IRequest): Promise<IResponse> {
    const offset = (page - 1) * limit;

    const { users, total } = await this.usersRepository.findAll({
      page,
      limit,
      offset,
      search,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      users,
      total,
      page,
      totalPages,
    };
  }
}
