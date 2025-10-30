import { IUserNotificationTokensRepository } from "@modules/accounts/repositories/interfaces/IUserNotificationTokensRepository";
import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { Expo } from "expo-server-sdk";
import { inject, injectable } from "tsyringe";

import { LoggerService } from "@shared/services/LoggerService";

export interface ICleanInvalidTokensResult {
  tokensRemoved: number;
  usersAffected: number;
  errors: string[];
}

@injectable()
export class CleanInvalidTokensUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
    @inject("UserNotificationTokensRepository")
    private tokenRepository: IUserNotificationTokensRepository
  ) {}

  async execute(olderThanDays?: number): Promise<ICleanInvalidTokensResult> {
    LoggerService.info("🧹 Iniciando limpeza de tokens inválidos");

    try {
      const { users } = await this.usersRepository.findAll({
        page: 1,
        limit: 10000,
        offset: 0,
      });

      const cutoffDate = olderThanDays
        ? new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000)
        : null;

      let tokensRemoved = 0;
      const usersAffected = new Set<number>();
      const errors: string[] = [];

      await Promise.all(
        users.map(async (user) => {
          if (
            !user.notificationTokens ||
            user.notificationTokens.length === 0
          ) {
            return;
          }

          const tokensToRemove = user.notificationTokens.filter(
            (tokenRecord) => {
              if (!tokenRecord.token || tokenRecord.token.trim() === "") {
                return true;
              }

              if (!Expo.isExpoPushToken(tokenRecord.token)) {
                return true;
              }

              if (tokenRecord.is_valid === false) {
                return true;
              }

              if (cutoffDate && tokenRecord.created_at < cutoffDate) {
                return true;
              }

              return false;
            }
          );

          if (tokensToRemove.length > 0) {
            try {
              await Promise.all(
                tokensToRemove.map(async (tokenRecord) => {
                  await this.tokenRepository.delete(tokenRecord.id);
                  tokensRemoved += 1;
                  usersAffected.add(user.id);

                  LoggerService.info(
                    `Token removido: usuário ${user.id}, token ID ${tokenRecord.id}`
                  );
                })
              );
            } catch (error) {
              const errorMessage = `Erro ao remover tokens do usuário ${
                user.id
              }: ${error instanceof Error ? error.message : String(error)}`;
              errors.push(errorMessage);
              LoggerService.error(errorMessage, error);
            }
          }
        })
      );

      const result: ICleanInvalidTokensResult = {
        tokensRemoved,
        usersAffected: usersAffected.size,
        errors,
      };

      LoggerService.info(
        `🧹 Limpeza concluída: ${tokensRemoved} tokens removidos de ${usersAffected.size} usuários`
      );

      return result;
    } catch (error) {
      LoggerService.error("Erro ao limpar tokens inválidos", error);
      return {
        tokensRemoved: 0,
        usersAffected: 0,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }
}
