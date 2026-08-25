import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { Inject, Injectable } from "@nestjs/common";

import { AppError } from "@shared/errors/AppError";

import { INotificationHistoryRepository } from "../../repositories/INotificationHistoryRepository";
import {
  IGetUserNotificationHistoryFilters,
  INotificationHistoryProps,
} from "../../types/notificationHistory";

@Injectable()
export class GetUserNotificationHistoryUseCase {
  constructor(
    @Inject("NotificationHistoryRepository")
    private notificationHistoryRepository: INotificationHistoryRepository,
    @Inject("UsersRepository")
    private usersRepository: IUsersRepository
  ) {}

  async execute(
    userId: number,
    filters?: IGetUserNotificationHistoryFilters
  ): Promise<{ history: INotificationHistoryProps[]; total: number }> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new AppError({
        message: "Usuário não encontrado",
        statusCode: 404,
      });
    }

    return this.notificationHistoryRepository.findByUserId(userId, filters);
  }
}
