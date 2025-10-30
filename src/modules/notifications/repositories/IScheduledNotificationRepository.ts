import {
  ICreateScheduledNotificationDTO,
  IScheduledNotificationProps,
  IUpdateScheduledNotificationDTO,
} from "../types/scheduledNotification";

export interface IScheduledNotificationRepository {
  create(
    data: ICreateScheduledNotificationDTO
  ): Promise<IScheduledNotificationProps>;
  findById(id: number): Promise<IScheduledNotificationProps | null>;
  findAll(filters?: {
    is_active?: boolean;
    created_by?: number;
  }): Promise<IScheduledNotificationProps[]>;
  findDue(now: Date): Promise<IScheduledNotificationProps[]>;
  update(
    data: IUpdateScheduledNotificationDTO
  ): Promise<IScheduledNotificationProps>;
  delete(id: number): Promise<void>;
  updateLastSentAt(id: number, sentAt: Date): Promise<void>;
  updateNextRunAt(id: number, nextRunAt: Date): Promise<void>;
}
