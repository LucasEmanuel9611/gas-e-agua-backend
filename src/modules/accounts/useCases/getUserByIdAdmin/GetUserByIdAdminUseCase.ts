import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { AdminUserListItem } from "@modules/accounts/types";
import { inject, injectable } from "tsyringe";

import { AppError } from "@shared/errors/AppError";

import { UserMap } from "../../mapper/UserMapper";

@injectable()
export class GetUserByIdAdminUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository
  ) {}

  async execute(userId: number): Promise<AdminUserListItem> {
    const user = await this.usersRepository.findByIdWithAccountSummary(userId);

    if (!user) {
      throw new AppError({
        message: "Usuário não encontrado",
        statusCode: 404,
      });
    }

    return UserMap.toAdminListItem(user);
  }
}
