import { instanceToInstance } from "class-transformer";

import {
  IUserResponseDTO,
  UserDates,
  AdminUserListItem,
  UserWithAccountSummary,
} from "../types";

export class UserMap {
  static toDTO({
    email,
    username,
    id,
    notificationTokens,
    role,
    telephone,
  }: UserDates): IUserResponseDTO {
    const user = instanceToInstance({
      email,
      username,
      id,
      notificationTokens,
      role,
      telephone,
    });
    return user;
  }

  static toAdminListItem({
    id,
    username,
    email,
    role,
    telephone,
    created_at,
    addresses,
    accountSummary,
  }: UserWithAccountSummary): AdminUserListItem {
    return {
      id,
      username,
      email,
      role,
      telephone,
      created_at,
      addresses,
      accountSummary,
    };
  }
}
