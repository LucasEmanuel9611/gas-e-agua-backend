import { instanceToInstance } from "class-transformer";

import { IUserResponseDTO, UserDates } from "../types";

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
}
