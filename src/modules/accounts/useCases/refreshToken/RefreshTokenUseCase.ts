import auth, { getRefreshExpiresInMs } from "@config/auth";
import { IUsersTokensRepository } from "@modules/accounts/repositories/interfaces/IUserTokensRepository";
import { Inject, Injectable } from "@nestjs/common";
import { sign, SignOptions, verify } from "jsonwebtoken";

import { AppError } from "@shared/errors/AppError";

interface IRequest {
  refreshToken: string;
}

interface IResponse {
  token: string;
  refreshToken: string;
}

interface IPayload {
  sub: string;
  role: string;
}

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject("UserTokensRepository")
    private userTokensRepository: IUsersTokensRepository
  ) {}

  async execute({ refreshToken }: IRequest): Promise<IResponse> {
    const {
      secret_refresh_token,
      secret_token,
      expires_in_token,
      expires_in_refresh_token,
    } = auth;

    let user_id: string;
    let role: string;

    try {
      const decoded = verify(refreshToken, secret_refresh_token) as IPayload;
      user_id = decoded.sub;
      role = decoded.role;
    } catch (error) {
      throw new AppError({
        message: "Invalid or expired refresh token",
        statusCode: 401,
      });
    }

    const userToken = await this.userTokensRepository.findByRefreshToken(
      refreshToken
    );

    if (!userToken) {
      throw new AppError({
        message: "Refresh token not found",
        statusCode: 401,
      });
    }

    await this.userTokensRepository.deleteById(userToken.id);

    const newToken = sign({ role }, secret_token, {
      subject: user_id,
      expiresIn: expires_in_token as SignOptions["expiresIn"],
    });

    const newRefreshToken = sign({ role }, secret_refresh_token, {
      subject: user_id,
      expiresIn: expires_in_refresh_token,
    });

    await this.userTokensRepository.create({
      user_id: Number(user_id),
      refresh_token: newRefreshToken,
      expires_date: new Date(Date.now() + getRefreshExpiresInMs()),
    });

    return {
      token: newToken,
      refreshToken: newRefreshToken,
    };
  }
}
