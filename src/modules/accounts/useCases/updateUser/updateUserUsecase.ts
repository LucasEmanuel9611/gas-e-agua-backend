import { UserMap } from "@modules/accounts/mapper/UserMapper";
import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { IUpdateUserDTO, IUserResponseDTO } from "@modules/accounts/types";
import { inject, injectable } from "tsyringe";

@injectable()
export class UpdateUserUseCase {
  constructor(
    @inject("UsersRepository")
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
