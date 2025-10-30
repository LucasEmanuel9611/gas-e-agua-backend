import { NotificationTokenProps } from "@modules/accounts/types";

import { prisma } from "@shared/infra/database/prisma";

import { IUserNotificationTokensRepository } from "../interfaces/IUserNotificationTokensRepository";

export class UserNotificationTokensRepository
  implements IUserNotificationTokensRepository
{
  async findById(id: number): Promise<NotificationTokenProps[]> {
    const foundUser = await prisma.user.findFirst({
      where: { id: Number(id) },
      include: {
        notificationTokens: true,
      },
    });

    return foundUser.notificationTokens;
  }

  async update(
    userId: number,
    newToken: string
  ): Promise<NotificationTokenProps> {
    const createdUserNotificationToken = await prisma.notificationToken.create({
      data: {
        token: newToken,
        user_id: userId,
      },
    });

    return createdUserNotificationToken;
  }

  async delete(tokenId: number): Promise<void> {
    await prisma.notificationToken.delete({
      where: {
        id: tokenId,
      },
    });
  }

  async markAsInvalid(tokenId: number): Promise<void> {
    await prisma.notificationToken.update({
      where: {
        id: tokenId,
      },
      data: {
        is_valid: false,
      },
    });
  }
}
