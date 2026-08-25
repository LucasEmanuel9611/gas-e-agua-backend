import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { AdminUserListItem } from "@modules/accounts/types";
import { Inject, Injectable } from "@nestjs/common";

import { AppError } from "@shared/errors/AppError";

import { UserMap } from "../../mapper/UserMapper";

@Injectable()
export class GetUserByIdAdminUseCase {
  constructor(
    @Inject("UsersRepository")
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
