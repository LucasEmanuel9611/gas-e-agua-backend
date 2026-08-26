import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Injectable, OnModuleDestroy } from "@nestjs/common";
import { Job } from "bullmq";

import { LoggerService } from "@shared/services/LoggerService";

import { ExpoPushService } from "../../../services/ExpoPushService";
import { NotificationTemplateService } from "../../../services/NotificationTemplateService";
import {
  IBirthdayNotificationJobData,
  IBulkNotificationJobData,
  IOrderNotificationJobData,
  NotificationJobType,
} from "../../../types/queueTypes";

type NotificationJobData =
  | IOrderNotificationJobData
  | IBulkNotificationJobData
  | IBirthdayNotificationJobData;

@Injectable()
@Processor("notifications", {
  concurrency: 10,
  removeOnComplete: { count: 200 },
  removeOnFail: { count: 100 },
})
export class NotificationWorker extends WorkerHost implements OnModuleDestroy {
  constructor(
    private expoPushService: ExpoPushService,
    @Inject("UsersRepository")
    private usersRepository: IUsersRepository,
    private templateService: NotificationTemplateService
  ) {
    super();
  }

  async process(job: Job<NotificationJobData>): Promise<void> {
    try {
      LoggerService.info(`Processing job ${job.id} in notifications-worker`);
      await this.processNotificationJob(job);
      LoggerService.info(
        `Job ${job.id} processed successfully in notifications-worker`
      );
    } catch (error) {
      LoggerService.error(
        `Error processing job ${job.id} in notifications-worker:`,
        error
      );
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.close();
  }

  async close(): Promise<void> {
    await this.worker.close();
    LoggerService.info("Worker notifications-worker closed");
  }

  @OnWorkerEvent("ready")
  onReady() {
    LoggerService.info("Worker notifications-worker is ready");
  }

  @OnWorkerEvent("error")
  onError(error: Error) {
    LoggerService.error("Worker notifications-worker error:", error);
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job | undefined, error: Error) {
    LoggerService.error(
      `Job ${job?.id} failed in worker notifications-worker:`,
      error
    );
  }

  @OnWorkerEvent("stalled")
  onStalled(jobId: string) {
    LoggerService.warn(`Job ${jobId} stalled in worker notifications-worker`);
  }

  @OnWorkerEvent("completed")
  onCompleted(job: Job) {
    LoggerService.info(
      `Job ${job.id} completed in worker notifications-worker`
    );
  }

  @OnWorkerEvent("active")
  onActive(job: Job) {
    LoggerService.info(`Job ${job.id} started in worker notifications-worker`);
  }

  @OnWorkerEvent("closing")
  onClosing() {
    LoggerService.info("Worker notifications-worker is closing");
  }

  @OnWorkerEvent("closed")
  onClosed() {
    LoggerService.info("Worker notifications-worker closed");
  }

  private async processNotificationJob(
    job: Job<NotificationJobData>
  ): Promise<void> {
    const jobType = job.name as NotificationJobType;

    LoggerService.info(
      `Processing notification job ${job.id} of type ${jobType}`
    );

    try {
      switch (jobType) {
        case NotificationJobType.ORDER:
          await this.processOrderNotification(
            job.data as IOrderNotificationJobData
          );
          break;

        case NotificationJobType.BULK:
          await this.processBulkNotification(
            job.data as IBulkNotificationJobData
          );
          break;

        case NotificationJobType.BIRTHDAY:
          await this.processBirthdayNotification(
            job.data as IBirthdayNotificationJobData
          );
          break;

        default:
          LoggerService.warn(`Unknown notification job type: ${jobType}`);
          break;
      }

      LoggerService.info(`Notification job ${job.id} processed successfully`);
    } catch (error) {
      LoggerService.error(
        `Error processing notification job ${job.id}:`,
        error
      );
      throw error;
    }
  }

  private async processOrderNotification(
    data: IOrderNotificationJobData
  ): Promise<void> {
    const { userId, notificationType, status, customData } = data;

    let templateId: string;

    switch (notificationType) {
      case "payment_due_soon":
        templateId = "payment_due_soon";
        break;
      case "payment_due_tomorrow":
        templateId = "payment_due_tomorrow";
        break;
      case "payment_late":
        templateId = "payment_late";
        break;
      case "status_change":
        templateId = `order_status_${status?.toLowerCase()}`;
        break;
      default:
        throw new Error(`Unknown order notification type: ${notificationType}`);
    }

    const template = this.templateService.getTemplate(templateId);
    if (!template || !template.isActive) {
      throw new Error(`Template ${templateId} not found or inactive.`);
    }

    const result = await this.expoPushService.sendPushToUser(userId, {
      title: template.title,
      body: template.body,
      data: { ...template.data, ...customData },
      sound: template.sound,
      badge: template.badge,
      priority: template.priority,
    });

    if (!result.success) {
      throw new Error(
        `Failed to send notification to user ${userId}: ${result.errors.join(
          ", "
        )}`
      );
    }

    LoggerService.info(
      `Order notification sent to user ${userId}: ${result.sent}/${result.total}`
    );
  }

  private async processBulkNotification(
    data: IBulkNotificationJobData
  ): Promise<void> {
    const { templateId, targetUsers, targetRoles, customData } = data;

    const template = this.templateService.getTemplate(templateId);
    if (!template || !template.isActive) {
      throw new Error(`Template ${templateId} not found or inactive.`);
    }

    const { users } = await this.usersRepository.findAll({
      page: 1,
      limit: 10000,
      offset: 0,
    });

    let targetUsersList = users;

    if (targetUsers && targetUsers.length > 0) {
      targetUsersList = targetUsersList.filter((user) =>
        targetUsers.includes(user.id)
      );
    }

    if (targetRoles && targetRoles.length > 0) {
      targetUsersList = targetUsersList.filter((user) =>
        targetRoles.includes(user.role)
      );
    }

    const customTitle = customData?.title;
    const customBody = customData?.body;
    const hasCustomTitle =
      typeof customTitle === "string" && customTitle.length > 0;
    const hasCustomBody =
      typeof customBody === "string" && customBody.length > 0;
    const notificationTitle = hasCustomTitle ? customTitle : template.title;
    const notificationBody = hasCustomBody ? customBody : template.body;

    const notifications = targetUsersList
      .filter(
        (user) => user.notificationTokens && user.notificationTokens.length > 0
      )
      .map((user) => ({
        tokens: user.notificationTokens?.map((token) => token.token) || [],
        payload: {
          title: notificationTitle,
          body: notificationBody,
          data: { ...template.data, ...customData },
          sound: template.sound,
          badge: template.badge,
          priority: template.priority,
        },
      }));

    if (notifications.length === 0) {
      LoggerService.warn("No users found for bulk notification");
      return;
    }

    const result = await this.expoPushService.sendBulkNotifications(
      notifications
    );

    LoggerService.info(
      `Bulk notification sent: ${result.success} success, ${result.failed} failed`
    );
  }

  private async processBirthdayNotification(
    data: IBirthdayNotificationJobData
  ): Promise<void> {
    const { userId, customData } = data;

    const template = this.templateService.getTemplate("user_birthday");
    if (!template || !template.isActive) {
      throw new Error("Birthday template not found or inactive.");
    }

    const result = await this.expoPushService.sendPushToUser(userId, {
      title: template.title,
      body: template.body,
      data: { ...template.data, ...customData },
      sound: template.sound,
      badge: template.badge,
      priority: template.priority,
    });

    if (!result.success) {
      throw new Error(
        `Failed to send birthday notification to user ${userId}: ${result.errors.join(
          ", "
        )}`
      );
    }

    LoggerService.info(
      `Birthday notification sent to user ${userId}: ${result.sent}/${result.total}`
    );
  }
}
