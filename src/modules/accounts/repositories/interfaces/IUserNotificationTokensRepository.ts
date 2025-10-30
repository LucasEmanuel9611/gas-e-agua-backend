import { NotificationTokenProps } from "../../types";

export interface IUserNotificationTokensRepository {
  findById(id: number): Promise<NotificationTokenProps[]>;
  update(userId: number, newToken: string): Promise<NotificationTokenProps>;
  delete(tokenId: number): Promise<void>;
  markAsInvalid(tokenId: number): Promise<void>;
}
