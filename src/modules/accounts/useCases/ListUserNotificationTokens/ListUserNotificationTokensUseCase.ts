import { IUserNotificationTokensRepository } from "@modules/accounts/repositories/interfaces/IUserNotificationTokensRepository";
import { NotificationTokenProps } from "@modules/accounts/types";
import { inject, injectable } from "tsyringe";

@injectable()
export class ListUserNotificationTokensUseCase {
  constructor(
    @inject("UserNotificationTokensRepository")
    private userNotificationTokensRepository: IUserNotificationTokensRepository
  ) {}

  async execute(id: number): Promise<NotificationTokenProps[]> {
    const userNotificationTokens =
      await this.userNotificationTokensRepository.findById(id);

    return userNotificationTokens;
  }
}
