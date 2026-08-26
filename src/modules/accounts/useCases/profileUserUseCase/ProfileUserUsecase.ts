import { UserMap } from "@modules/accounts/mapper/UserMapper";
import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { IUserResponseDTO } from "@modules/accounts/types";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class ProfileUserUseCase {
  constructor(
    @Inject("UsersRepository")
    private usersRepository: IUsersRepository
  ) {}

  async execute(id: number): Promise<IUserResponseDTO> {
    const user = await this.usersRepository.findById(id);

    return UserMap.toDTO(user);
  }
}
