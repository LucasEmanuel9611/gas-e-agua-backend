import { BaseQueue, IQueueJob } from "@shared/infra/queues/BaseQueue";
import { redisConnection } from "@shared/infra/redis/redisConnection";

import {
  NotificationPriority,
  NotificationType,
} from "../../types/NotificationTypes";
import {
  IBirthdayNotificationJobData,
  IBulkNotificationJobData,
  IOrderNotificationJobData,
  NotificationJobType,
} from "../../types/queueTypes";

export class NotificationQueue extends BaseQueue<
  | IOrderNotificationJobData
  | IBulkNotificationJobData
  | IBirthdayNotificationJobData
> {
  constructor() {
    super("notifications", {
      connection: redisConnection,
      defaultJobOptions: {
        removeOnComplete: 200,
        removeOnFail: 100,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      },
    });
  }

  async addOrderNotification(
    orderId: number,
    userId: number,
    notificationType: NotificationType,
    status?: string,
    customData?: Record<string, unknown>
  ) {
    const priority =
      notificationType === NotificationType.PAYMENT_DUE_SOON ||
      notificationType === NotificationType.PAYMENT_LATE
        ? NotificationPriority.HIGH
        : NotificationPriority.NORMAL;

    const jobData: IQueueJob<IOrderNotificationJobData> = {
      name: NotificationJobType.ORDER,
      data: {
        orderId,
        userId,
        notificationType,
        status,
        customData,
      },
      options: {
        priority: this.getPriorityValue(priority),
      },
    };

    return this.addJob(jobData);
  }

  async addBulkNotification(
    templateId: string,
    targetUsers?: number[],
    targetRoles?: string[],
    customData?: Record<string, unknown>,
    priority: NotificationPriority = NotificationPriority.NORMAL
  ) {
    const jobData: IQueueJob<IBulkNotificationJobData> = {
      name: NotificationJobType.BULK,
      data: {
        templateId,
        targetUsers,
        targetRoles,
        customData,
        priority,
      },
      options: {
        priority: this.getPriorityValue(priority),
      },
    };

    return this.addJob(jobData);
  }

  async addBirthdayNotification(
    userId: number,
    customData?: Record<string, unknown>
  ) {
    const jobData: IQueueJob<IBirthdayNotificationJobData> = {
      name: NotificationJobType.BIRTHDAY,
      data: {
        userId,
        customData,
      },
      options: {
        priority: this.getPriorityValue(NotificationPriority.HIGH),
      },
    };

    return this.addJob(jobData);
  }

  private getPriorityValue(priority: NotificationPriority): number {
    switch (priority) {
      case NotificationPriority.LOW:
        return 1;
      case NotificationPriority.NORMAL:
        return 5;
      case NotificationPriority.HIGH:
        return 10;
      default:
        return 5;
    }
  }
}

export const notificationQueue = new NotificationQueue();
