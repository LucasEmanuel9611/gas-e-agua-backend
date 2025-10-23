import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { inject, injectable } from "tsyringe";

@injectable()
export class DeleteAddressUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository
  ) {}

  async execute(userId: number, addressId: number): Promise<void> {
    await this.usersRepository.deleteAddress(userId, addressId);
  }
}
