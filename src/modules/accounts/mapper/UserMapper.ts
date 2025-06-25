import { instanceToInstance } from "class-transformer";

import { IUserResponseDTO, UserDates } from "../types";

export class UserMap {
  static toDTO({
    email,
    username,
    id,
    notificationTokens,
    role,
  }: UserDates): IUserResponseDTO {
    const user = instanceToInstance({
      email,
      username,
      id,
      notificationTokens,
      role,
    });
    return user;
  }
}
