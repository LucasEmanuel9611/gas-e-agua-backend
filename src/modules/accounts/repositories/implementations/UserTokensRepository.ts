import { ICreateUserTokenDTO, UserTokens } from "../../types";
import { IUsersTokensRepository } from "../interfaces/IUserTokensRepository";

export class UsersTokensRepository implements IUsersTokensRepository {
  usersTokens: UserTokens[] = [];

  async create({
    expires_date,
    refresh_token,
    user_id,
  }: ICreateUserTokenDTO): Promise<UserTokens> {
    const userToken = new UserTokens();

    Object.assign(userToken, {
      expires_date,
      refresh_token,
      user_id,
    });

    this.usersTokens.push(userToken);

    return userToken;
  }
}
