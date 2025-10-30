import { injectable } from "tsyringe";

import { notificationQueue } from "../../infra/queues/NotificationQueue";
import { INotificationResult } from "../../types/index";

interface ISendNotificationRequest {
  userId: number;
  templateId: string;
  customData?: Record<string, any>;
  priority?: "low" | "normal" | "high";
}

interface ISendBulkNotificationRequest {
  templateId: string;
  targetUsers?: number[];
  targetRoles?: string[];
  customData?: Record<string, any>;
  priority?: "low" | "normal" | "high";
}

interface ISendScheduledNotificationRequest {
  templateId: string;
  scheduledFor: Date;
  targetUsers?: number[];
  targetRoles?: string[];
  customData?: Record<string, any>;
  priority?: "low" | "normal" | "high";
}

@injectable()
export class SendNotificationUseCase {
  async sendSingleNotification(
    request: ISendNotificationRequest
  ): Promise<INotificationResult> {
    try {
      const job = await notificationQueue.addSingleNotification(
        request.userId,
        request.templateId,
        request.customData,
        request.priority
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
    request: ISendBulkNotificationRequest
  ): Promise<INotificationResult> {
    try {
      const job = await notificationQueue.addBulkNotification(
        request.templateId,
        request.targetUsers,
        request.targetRoles,
        request.customData,
        request.priority
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

  async sendScheduledNotification(
    request: ISendScheduledNotificationRequest
  ): Promise<INotificationResult> {
    try {
      const job = await notificationQueue.addScheduledNotification(
        request.templateId,
        request.scheduledFor,
        request.targetUsers,
        request.targetRoles,
        request.customData,
        request.priority
      );

      return {
        success: true,
        sent: 0,
        failed: 0,
        total: 0,
        jobId: job.id,
        scheduledFor: request.scheduledFor,
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

  async sendOrderNotification(
    orderId: number,
    userId: number,
    notificationType: "expiration" | "overdue" | "status_change",
    status?: string,
    customData?: Record<string, any>
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

  async sendPromotionNotification(
    promotionId: string,
    targetUsers?: number[],
    targetRoles?: string[],
    customData?: Record<string, any>,
    priority: "low" | "normal" | "high" = "high"
  ): Promise<INotificationResult> {
    try {
      const job = await notificationQueue.addPromotionNotification(
        promotionId,
        targetUsers,
        targetRoles,
        customData,
        priority
      );

      return {
        success: true,
        sent: 0,
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
    customData?: Record<string, any>
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
