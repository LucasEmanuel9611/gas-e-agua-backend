import { NotificationJobType, NotificationType } from "./NotificationTypes";

export interface IOrderNotificationJobData {
  orderId: number;
  userId: number;
  notificationType: NotificationType;
  status?: string;
  customData?: Record<string, unknown>;
}

export interface IBulkNotificationJobData {
  templateId: string;
  targetUsers?: number[];
  targetRoles?: string[];
  customData?: Record<string, unknown>;
  priority?: string;
}

export interface IBirthdayNotificationJobData {
  userId: number;
  customData?: Record<string, unknown>;
}

export { NotificationJobType, NotificationType };
