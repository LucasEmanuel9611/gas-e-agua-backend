import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class DeleteAddressUseCase {
  constructor(
    @Inject("UsersRepository")
    private usersRepository: IUsersRepository
  ) {}

  async execute(userId: number, addressId: number): Promise<void> {
    await this.usersRepository.deleteAddress(userId, addressId);
  }
}
