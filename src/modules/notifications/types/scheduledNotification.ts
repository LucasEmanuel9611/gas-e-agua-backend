export enum RecurrencePattern {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  YEARLY = "yearly",
}

export interface IScheduledNotificationProps {
  id: number;
  title: string;
  body: string;
  target_users?: string;
  target_roles?: string;
  scheduled_for: Date;
  recurrence_pattern?: RecurrencePattern;
  timezone?: string;
  is_active: boolean;
  last_sent_at?: Date;
  next_run_at?: Date;
  created_by: number;
  created_at: Date;
  updated_at: Date;
  data?: string;
}

export interface ICreateScheduledNotificationDTO {
  title: string;
  body: string;
  target_users?: number[];
  target_roles?: string[];
  scheduled_for: Date;
  recurrence_pattern?: RecurrencePattern;
  timezone?: string;
  created_by: number;
  data?: Record<string, unknown>;
}

export interface IUpdateScheduledNotificationDTO {
  id: number;
  title?: string;
  body?: string;
  target_users?: number[];
  target_roles?: string[];
  scheduled_for?: Date;
  recurrence_pattern?: RecurrencePattern;
  timezone?: string;
  is_active?: boolean;
  data?: Record<string, unknown>;
}
