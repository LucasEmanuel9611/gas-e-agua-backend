import { UserMap } from "@modules/accounts/mapper/UserMapper";
import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { IUserResponseDTO } from "@modules/accounts/types";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class ListAdminUserUseCase {
  constructor(
    @Inject("UsersRepository")
    private usersRepository: IUsersRepository
  ) {}

  async execute(): Promise<IUserResponseDTO> {
    const adminUser = await this.usersRepository.findAdmin();

    return UserMap.toDTO(adminUser);
  }
}
