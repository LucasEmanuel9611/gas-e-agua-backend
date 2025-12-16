import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import {
  AddressDates,
  IUpdateAddressRequestDTO,
} from "@modules/accounts/types";
import { inject, injectable } from "tsyringe";

import { AppError } from "@shared/errors/AppError";

@injectable()
export class UpdateAddressUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository
  ) {}

  async execute(data: IUpdateAddressRequestDTO): Promise<AddressDates> {
    const { userId, addressId, address } = data;

    const currentUser = await this.usersRepository.findById(userId);
    const existingAddress = currentUser.addresses.find(
      (addr) => addr.id === addressId
    );

    if (!existingAddress) {
      throw new AppError({
        message: "Endereço não encontrado",
        statusCode: 404,
      });
    }

    return this.usersRepository.updateAddress({
      userId,
      addressId,
      address,
    });
  }
}
