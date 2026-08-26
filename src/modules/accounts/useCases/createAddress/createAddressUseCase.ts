import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import {
  AddressDates,
  ICreateAddressRequestDTO,
} from "@modules/accounts/types";
import { Inject, Injectable } from "@nestjs/common";

import { AppError } from "@shared/errors/AppError";

@Injectable()
export class CreateAddressUseCase {
  constructor(
    @Inject("UsersRepository")
    private usersRepository: IUsersRepository
  ) {}

  async execute(data: ICreateAddressRequestDTO): Promise<AddressDates> {
    const { userId, address } = data;

    const currentUser = await this.usersRepository.findById(userId);
    if (currentUser.addresses.length >= 5) {
      throw new AppError({
        message: "Usuário pode ter no máximo 5 endereços",
        statusCode: 400,
      });
    }

    const isDefault = currentUser.addresses.length === 0;

    return this.usersRepository.createAddress({
      userId,
      address: { ...address, isDefault } as any,
    });
  }
}
