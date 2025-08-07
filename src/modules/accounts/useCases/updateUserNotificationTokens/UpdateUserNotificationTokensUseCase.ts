import { IUserNotificationTokensRepository } from "@modules/accounts/repositories/interfaces/IUserNotificationTokensRepository";
import { NotificationTokenProps } from "@modules/accounts/types";
import { inject, injectable } from "tsyringe";

@injectable()
export class UpdateUserNotificationTokensUseCase {
  constructor(
    @inject("UserNotificationTokensRepository")
    private userNotificationTokensRepository: IUserNotificationTokensRepository
  ) {}

  async execute(id: number, token: string): Promise<NotificationTokenProps> {
    const userNotificationTokens =
      await this.userNotificationTokensRepository.update(id, token);

    return userNotificationTokens;
  }
}
