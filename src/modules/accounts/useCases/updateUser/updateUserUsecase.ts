import { UserMap } from "@modules/accounts/mapper/UserMapper";
import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { IUpdateUserDTO, IUserResponseDTO } from "@modules/accounts/types";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject("UsersRepository")
    private usersRepository: IUsersRepository
  ) {}

  async execute(data: IUpdateUserDTO): Promise<IUserResponseDTO> {
    const user = await this.usersRepository.update({
      id: data.id,
      username: data.username,
      telephone: data.telephone,
    });

    return UserMap.toDTO(user);
  }
}
