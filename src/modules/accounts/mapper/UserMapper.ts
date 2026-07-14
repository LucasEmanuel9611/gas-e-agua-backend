import { instanceToInstance } from "class-transformer";

import {
  IUserResponseDTO,
  UserDates,
  AdminUserListItem,
  UserRole,
  UserWithAccountSummary,
  NotificationTokenProps,
} from "../types";
import { AddressMap, PersistenceAddress } from "./AddressMapper";

type PersistenceUser = {
  id: number;
  username: string;
  email: string;
  password: string;
  role: string;
  created_at: Date;
  telephone: string;
  addresses: PersistenceAddress[];
  notificationTokens?: NotificationTokenProps[];
};

export class UserMap {
  static toDomain(user: PersistenceUser): UserDates {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role as UserRole,
      created_at: user.created_at,
      telephone: user.telephone,
      notificationTokens: user.notificationTokens,
      addresses: user.addresses.map(AddressMap.toDomain),
    };
  }

  static toDTO({
    email,
    username,
    id,
    notificationTokens,
    role,
    telephone,
  }: UserDates): IUserResponseDTO {
    return instanceToInstance({
      email,
      username,
      id,
      notificationTokens: notificationTokens ?? [],
      role,
      telephone,
    });
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
