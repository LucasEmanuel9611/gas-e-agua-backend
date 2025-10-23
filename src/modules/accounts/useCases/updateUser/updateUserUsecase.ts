import { UserMap } from "@modules/accounts/mapper/UserMapper";
import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import {
  AddressDates,
  IUpdateUserDTO,
  IUserResponseDTO,
} from "@modules/accounts/types";
import { inject, injectable } from "tsyringe";

import { AppError } from "@shared/errors/AppError";

@injectable()
export class UpdateUserUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository
  ) {}

  async execute(data: IUpdateUserDTO): Promise<IUserResponseDTO> {
    if (data.addresses) {
      await this.validateAddressLimit(data.id, data.addresses);
    }

    const user = await this.usersRepository.update(data);

    return UserMap.toDTO(user);
  }

  private async validateAddressLimit(
    userId: number,
    addresses: Partial<AddressDates>[]
  ): Promise<void> {
    const currentUser = await this.usersRepository.findById(userId);
    const currentAddressCount = currentUser.addresses.length;
    const newAddressesCount = addresses.filter((addr) => !addr.id).length;
    const totalAfterUpdate = currentAddressCount + newAddressesCount;

    if (totalAfterUpdate > 5) {
      throw new AppError({
        message: "Usuário pode ter no máximo 5 endereços",
        statusCode: 400,
      });
    }
  }
}
