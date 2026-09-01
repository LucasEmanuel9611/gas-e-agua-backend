import { IUserNotificationTokensRepository } from "@modules/accounts/repositories/interfaces/IUserNotificationTokensRepository";
import { inject, injectable } from "tsyringe";

@injectable()
export class DeleteUserNotificationTokenUseCase {
  constructor(
    @inject("UserNotificationTokensRepository")
    private userNotificationTokensRepository: IUserNotificationTokensRepository
  ) {}

  async execute(userId: number, token: string): Promise<void> {
    await this.userNotificationTokensRepository.deleteByToken(token, userId);
  }
}
