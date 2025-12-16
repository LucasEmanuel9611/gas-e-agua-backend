import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { inject, injectable } from "tsyringe";

import { AppError } from "@shared/errors/AppError";

import { INotificationHistoryRepository } from "../../repositories/INotificationHistoryRepository";
import {
  IGetUserNotificationHistoryFilters,
  INotificationHistoryProps,
} from "../../types/notificationHistory";

@injectable()
export class GetUserNotificationHistoryUseCase {
  constructor(
    @inject("NotificationHistoryRepository")
    private notificationHistoryRepository: INotificationHistoryRepository,
    @inject("UsersRepository")
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
