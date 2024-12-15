import { UserMap } from "@modules/accounts/mapper/UserMapper";
import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { IUserResponseDTO } from "@modules/accounts/types";
import { inject, injectable } from "tsyringe";

@injectable()
export class ProfileUserUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository
  ) {}

  async execute(id: number): Promise<IUserResponseDTO> {
    const user = await this.usersRepository.findById(id);

    return UserMap.toDTO(user);
  }
}
