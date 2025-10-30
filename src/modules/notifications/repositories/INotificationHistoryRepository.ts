import {
  ICreateNotificationHistoryDTO,
  IGetUserNotificationHistoryFilters,
  INotificationHistoryProps,
  IUpdateNotificationHistoryDTO,
} from "../types/notificationHistory";

export interface INotificationHistoryRepository {
  create(
    data: ICreateNotificationHistoryDTO
  ): Promise<INotificationHistoryProps>;
  findById(id: number): Promise<INotificationHistoryProps | null>;
  findByUserId(
    userId: number,
    filters?: IGetUserNotificationHistoryFilters
  ): Promise<{ history: INotificationHistoryProps[]; total: number }>;
  update(
    data: IUpdateNotificationHistoryDTO
  ): Promise<INotificationHistoryProps>;
}
