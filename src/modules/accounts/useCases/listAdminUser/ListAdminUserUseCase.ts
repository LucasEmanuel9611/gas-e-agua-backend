import { UserMap } from "@modules/accounts/mapper/UserMapper";
import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { IUserResponseDTO } from "@modules/accounts/types";
import { inject, injectable } from "tsyringe";

@injectable()
export class ListAdminUserUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository
  ) {}

  async execute(): Promise<IUserResponseDTO> {
    const adminUser = await this.usersRepository.findAdmin();

    return UserMap.toDTO(adminUser);
  }
}
