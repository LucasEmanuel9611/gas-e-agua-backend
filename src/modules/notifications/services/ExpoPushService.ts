import { IUserNotificationTokensRepository } from "@modules/accounts/repositories/interfaces/IUserNotificationTokensRepository";
import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { Expo, ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";
import { inject, injectable } from "tsyringe";

import { LoggerService } from "@shared/services/LoggerService";
import { metricsService } from "@shared/services/MetricsService";

import { INotificationHistoryRepository } from "../repositories/INotificationHistoryRepository";
import { IPushNotificationPayload } from "../types";
import { NotificationStatus } from "../types/notificationHistory";

@injectable()
export class ExpoPushService {
  private expo: Expo;

  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
    @inject("UserNotificationTokensRepository")
    private tokenRepository: IUserNotificationTokensRepository,
    @inject("NotificationHistoryRepository")
    private historyRepository: INotificationHistoryRepository
  ) {
    this.expo = new Expo({
      accessToken: process.env.EXPO_ACCESS_TOKEN,
      useFcmV1: true,
    });
  }

  async sendPushNotification(payload: IPushNotificationPayload): Promise<{
    success: boolean;
    sent: number;
    failed: number;
    total: number;
    errors: string[];
  }> {
    const startTime = Date.now();
    const notificationType =
      (payload.data?.notificationType as string) || "unknown";
    const priority = payload.priority || "normal";

    try {
      const messages: ExpoPushMessage[] = [];
      const tokens = Array.isArray(payload.to) ? payload.to : [payload.to];
      const validTokens = tokens.filter((token) => Expo.isExpoPushToken(token));

      if (validTokens.length === 0) {
        LoggerService.warn(
          "Nenhum token válido encontrado para envio de notificação"
        );
        metricsService.recordNotificationFailed(
          notificationType,
          "no_valid_tokens"
        );
        return {
          success: false,
          sent: 0,
          failed: 0,
          total: 0,
          errors: ["No valid tokens"],
        };
      }

      validTokens.forEach((token) => {
        messages.push({
          to: token,
          title: payload.title,
          body: payload.body,
          data: payload.data,
          sound: payload.sound || "default",
          badge: payload.badge,
          priority:
            (payload.priority as "default" | "normal" | "high") || "normal",
          channelId: payload.channelId,
        });
      });

      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets: ExpoPushTicket[] = [];

      await Promise.all(
        chunks.map(async (chunk) => {
          try {
            const ticketChunk = await this.expo.sendPushNotificationsAsync(
              chunk
            );
            tickets.push(...ticketChunk);
          } catch (error) {
            LoggerService.error("Erro ao enviar chunk de notificações", error);
            metricsService.recordNotificationFailed(
              notificationType,
              "send_error"
            );
          }
        })
      );

      const result = await this.checkReceipts(tickets, notificationType);

      const duration = (Date.now() - startTime) / 1000;
      metricsService.recordNotificationProcessingDuration(
        notificationType,
        "push",
        duration
      );

      metricsService.recordNotificationSent(notificationType, priority);

      if (result.sent > 0) {
        for (let i = 0; i < result.sent; i += 1) {
          metricsService.recordNotificationDelivered(notificationType);
        }
      }

      if (result.failed > 0 && result.errors.length > 0) {
        result.errors.forEach(() => {
          metricsService.recordNotificationFailed(
            notificationType,
            "delivery_error"
          );
        });
      }

      const deliveryRate = (result.sent / (result.sent + result.failed)) * 100;
      metricsService.updateNotificationDeliveryRate(deliveryRate);

      LoggerService.info(
        `Notificações enviadas: ${result.sent}/${result.sent + result.failed}`
      );
      return {
        success: true,
        sent: result.sent,
        failed: result.failed,
        total: tickets.length,
        errors: result.errors,
      };
    } catch (error) {
      LoggerService.error("Erro ao enviar notificação push", error);
      metricsService.recordNotificationFailed(notificationType, "exception");
      return {
        success: false,
        sent: 0,
        failed: 0,
        total: 0,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  async sendPushToUser(
    userId: number,
    payload: Omit<IPushNotificationPayload, "to">
  ): Promise<{
    success: boolean;
    sent: number;
    failed: number;
    total: number;
    errors: string[];
  }> {
    try {
      const user = await this.usersRepository.findById(userId);
      if (
        !user ||
        !user.notificationTokens ||
        user.notificationTokens.length === 0
      ) {
        return {
          success: false,
          sent: 0,
          failed: 0,
          total: 0,
          errors: ["User not found or no tokens"],
        };
      }

      const validTokenRecords = user.notificationTokens.filter(
        (tokenRecord) =>
          tokenRecord.is_valid !== false &&
          Expo.isExpoPushToken(tokenRecord.token)
      );

      const tokens = validTokenRecords.map((token) => token.token);

      const result = await this.sendPushNotification({
        ...payload,
        to: tokens,
        data: {
          ...payload.data,
          userId,
          tokenRecords: validTokenRecords,
        },
      });

      const notificationType =
        (payload.data?.notificationType as string) || "push_notification";

      try {
        await this.historyRepository.create({
          user_id: userId,
          type: notificationType,
          title: payload.title,
          body: payload.body,
          status:
            result.sent > 0
              ? NotificationStatus.SENT
              : NotificationStatus.FAILED,
          data: payload.data,
        });
      } catch (historyError) {
        LoggerService.error(
          "Erro ao registrar histórico de notificação",
          historyError
        );
      }

      return result;
    } catch (error) {
      LoggerService.error(
        `Erro ao enviar notificação para usuário ${userId}`,
        error
      );
      return {
        success: false,
        sent: 0,
        failed: 0,
        total: 0,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  private async markTokenAsInvalid(tokenId: number): Promise<void> {
    try {
      await this.tokenRepository.markAsInvalid(tokenId);
      LoggerService.info(`Token ${tokenId} marcado como inválido`);
    } catch (error) {
      LoggerService.error(
        `Erro ao marcar token ${tokenId} como inválido`,
        error
      );
    }
  }

  async sendBulkNotifications(
    notifications: Array<{
      tokens: string[];
      payload: Omit<IPushNotificationPayload, "to">;
    }>
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    notifications.forEach(async (notification) => {
      const result = await this.sendPushNotification({
        ...notification.payload,
        to: notification.tokens,
      });

      if (result.success) {
        success += result.sent;
        failed += result.failed;
      } else {
        failed += notification.tokens.length;
      }
    });

    return { success, failed };
  }

  private async checkReceipts(
    tickets: ExpoPushTicket[],
    notificationType: string
  ): Promise<{ sent: number; failed: number; errors: string[] }> {
    const receiptIds: string[] = [];
    const errors: string[] = [];
    let sent = 0;
    let failed = 0;

    tickets.forEach((ticket, index) => {
      if (ticket.status === "error") {
        failed += 1;
        const errorReason = ticket.message?.includes("DeviceNotRegistered")
          ? "device_not_registered"
          : "ticket_error";
        errors.push(`Ticket ${index}: ${ticket.message}`);
        metricsService.recordNotificationFailed(notificationType, errorReason);
        LoggerService.error(
          `Erro no ticket ${index}:`,
          new Error(ticket.message)
        );
      } else if (ticket.status === "ok") {
        sent += 1;
        receiptIds.push(ticket.id);
      }
    });

    if (receiptIds.length === 0) {
      return { sent, failed, errors };
    }

    try {
      const receiptIdChunks =
        this.expo.chunkPushNotificationReceiptIds(receiptIds);

      await Promise.all(
        receiptIdChunks.map(async (chunk) => {
          const receipts = await this.expo.getPushNotificationReceiptsAsync(
            chunk
          );

          Object.entries(receipts).forEach(([receiptId, receipt]) => {
            if (receipt.status === "error") {
              failed += 1;
              errors.push(`Receipt ${receiptId}: ${receipt.message}`);
              LoggerService.error(
                `Erro no receipt ${receiptId}:`,
                new Error(receipt.message)
              );
            } else if (receipt.status === "ok") {
              LoggerService.info(`Notificação entregue: ${receiptId}`);
            }
          });
        })
      );
    } catch (error) {
      LoggerService.error("Erro ao verificar receipts", error);
      errors.push(
        `Erro ao verificar receipts: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    return { sent, failed, errors };
  }
}
