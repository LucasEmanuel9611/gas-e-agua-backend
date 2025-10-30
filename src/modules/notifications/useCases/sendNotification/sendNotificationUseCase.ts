import { injectable } from "tsyringe";

import { notificationQueue } from "../../infra/queues/NotificationQueue";
import { INotificationResult } from "../../types/index";
import {
  NotificationPriority,
  NotificationType,
} from "../../types/NotificationTypes";

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
