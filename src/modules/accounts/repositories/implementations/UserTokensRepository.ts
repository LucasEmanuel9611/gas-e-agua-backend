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

  async findByRefreshToken(refreshToken: string): Promise<UserTokens | null> {
    const userToken = this.usersTokens.find(
      (token) => token.refresh_token === refreshToken
    );

    return userToken || null;
  }

  async deleteById(id: number): Promise<void> {
    const tokenIndex = this.usersTokens.findIndex((token) => token.id === id);

    if (tokenIndex > -1) {
      this.usersTokens.splice(tokenIndex, 1);
    }
  }
}
