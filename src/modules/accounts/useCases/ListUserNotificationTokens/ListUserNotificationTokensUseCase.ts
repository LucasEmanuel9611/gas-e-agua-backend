import { IUserNotificationTokensRepository } from "@modules/accounts/repositories/interfaces/IUserNotificationTokensRepository";
import { NotificationTokenProps } from "@modules/accounts/types";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class ListUserNotificationTokensUseCase {
  constructor(
    @Inject("UserNotificationTokensRepository")
    private userNotificationTokensRepository: IUserNotificationTokensRepository
  ) {}

  async execute(id: number): Promise<NotificationTokenProps[]> {
    const userNotificationTokens =
      await this.userNotificationTokensRepository.findById(id);

    return userNotificationTokens;
  }
}
