export enum NotificationStatus {
  SENT = "sent",
  DELIVERED = "delivered",
  FAILED = "failed",
}

export interface INotificationHistoryProps {
  id: number;
  user_id: number;
  type: string;
  title: string;
  body: string;
  status: NotificationStatus;
  sent_at: Date;
  delivered_at?: Date;
  error?: string;
  data?: string;
}

export interface ICreateNotificationHistoryDTO {
  user_id: number;
  type: string;
  title: string;
  body: string;
  status: NotificationStatus;
  data?: Record<string, unknown>;
}

export interface IUpdateNotificationHistoryDTO {
  id: number;
  status?: NotificationStatus;
  delivered_at?: Date;
  error?: string;
}

export interface IGetUserNotificationHistoryFilters {
  type?: string;
  status?: NotificationStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}
