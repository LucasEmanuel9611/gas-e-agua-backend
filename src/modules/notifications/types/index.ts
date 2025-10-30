export interface INotificationResult {
  success: boolean;
  sent: number;
  failed: number;
  total: number;
  jobId?: string;
  scheduledFor?: Date;
  errors?: string[];
}

export interface IPushNotificationPayload {
  to: string | string[];
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: string;
  badge?: number;
  priority?: string;
  channelId?: string;
}

export enum NotificationCategory {
  PAYMENT = "payment",
  ORDER = "order",
  PROMOTION = "promotion",
  BIRTHDAY = "birthday",
  REMINDER = "reminder",
  EVENT = "event",
  SYSTEM = "system",
}

export interface INotificationTemplate {
  id: string;
  title: string;
  body: string;
  category: NotificationCategory;
  isActive: boolean;
  priority?: "low" | "normal" | "high";
  sound?: string;
  badge?: number;
  data?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
