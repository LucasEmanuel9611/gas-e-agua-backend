import { injectable } from "tsyringe";

import { AppError } from "@shared/errors/AppError";

import { notificationQueue } from "../../infra/queues/NotificationQueue";
import { INotificationResult } from "../../types/index";
import {
  NotificationPriority,
  NotificationType,
} from "../../types/NotificationTypes";

const CUSTOMER_BROADCAST_TEMPLATE_ID = "admin_broadcast";
const CUSTOMER_TARGET_ROLE = "USER";
const BROADCAST_TITLE_MAX_LENGTH = 100;
const BROADCAST_MESSAGE_MAX_LENGTH = 500;

function getTrimmedBroadcastField(
  fieldValue: unknown,
  emptyMessage: string,
  maxLength: number,
  tooLongMessage: string
): string {
  if (typeof fieldValue !== "string") {
    throw new AppError({
      message: emptyMessage,
      statusCode: 400,
    });
  }

  const trimmedFieldValue = fieldValue.trim();

  if (!trimmedFieldValue) {
    throw new AppError({
      message: emptyMessage,
      statusCode: 400,
    });
  }

  if (trimmedFieldValue.length > maxLength) {
    throw new AppError({
      message: tooLongMessage,
      statusCode: 400,
    });
  }

  return trimmedFieldValue;
}

@injectable()
export class SendNotificationUseCase {
  async sendOrderNotification(
    orderId: number,
    userId: number,
    notificationType: NotificationType,
    status?: string,
    customData?: Record<string, unknown>
  ): Promise<INotificationResult> {
    try {
      const job = await notificationQueue.addOrderNotification(
        orderId,
        userId,
        notificationType,
        status,
        customData
      );

      return {
        success: true,
        sent: 1,
        failed: 0,
        total: 1,
        jobId: job.id,
      };
    } catch (error) {
      return {
        success: false,
        sent: 0,
        failed: 1,
        total: 1,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  async sendBulkNotification(
    templateId: string,
    targetUsers?: number[],
    targetRoles?: string[],
    customData?: Record<string, unknown>,
    priority: NotificationPriority = NotificationPriority.NORMAL
  ): Promise<INotificationResult> {
    try {
      const job = await notificationQueue.addBulkNotification(
        templateId,
        targetUsers,
        targetRoles,
        customData,
        priority
      );

      return {
        success: true,
        sent: 0, // Will be updated by worker
        failed: 0,
        total: 0,
        jobId: job.id,
      };
    } catch (error) {
      return {
        success: false,
        sent: 0,
        failed: 0,
        total: 0,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  async sendBroadcastToUsers(
    title: unknown,
    message: unknown
  ): Promise<INotificationResult> {
    const broadcastTitle = getTrimmedBroadcastField(
      title,
      "O título da notificação é obrigatório",
      BROADCAST_TITLE_MAX_LENGTH,
      `O título deve ter no máximo ${BROADCAST_TITLE_MAX_LENGTH} caracteres`
    );
    const broadcastMessage = getTrimmedBroadcastField(
      message,
      "A mensagem da notificação é obrigatória",
      BROADCAST_MESSAGE_MAX_LENGTH,
      `A mensagem deve ter no máximo ${BROADCAST_MESSAGE_MAX_LENGTH} caracteres`
    );

    return this.sendBulkNotification(
      CUSTOMER_BROADCAST_TEMPLATE_ID,
      undefined,
      [CUSTOMER_TARGET_ROLE],
      {
        title: broadcastTitle,
        body: broadcastMessage,
        notificationType: CUSTOMER_BROADCAST_TEMPLATE_ID,
      },
      NotificationPriority.HIGH
    );
  }

  async sendBirthdayNotification(
    userId: number,
    customData?: Record<string, unknown>
  ): Promise<INotificationResult> {
    try {
      const job = await notificationQueue.addBirthdayNotification(
        userId,
        customData
      );

      return {
        success: true,
        sent: 1,
        failed: 0,
        total: 1,
        jobId: job.id,
      };
    } catch (error) {
      return {
        success: false,
        sent: 0,
        failed: 1,
        total: 1,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }
}
