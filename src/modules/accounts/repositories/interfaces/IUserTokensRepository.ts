import { ICreateUserTokenDTO, UserTokens } from "../../types";

export interface IUsersTokensRepository {
  create({
    expires_date,
    refresh_token,
    user_id,
  }: ICreateUserTokenDTO): Promise<UserTokens>;
  findByRefreshToken(refreshToken: string): Promise<UserTokens | null>;
  deleteById(id: number): Promise<void>;
}
