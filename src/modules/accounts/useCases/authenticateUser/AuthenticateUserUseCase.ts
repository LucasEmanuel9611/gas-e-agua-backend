import auth from "@config/auth";
import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { IUsersTokensRepository } from "@modules/accounts/repositories/interfaces/IUserTokensRepository";
import { AddressDates, UserRole } from "@modules/accounts/types";
import { compare } from "bcrypt";
import { sign, SignOptions } from "jsonwebtoken";
import { inject, injectable } from "tsyringe";

import { AppError } from "@shared/errors/AppError";

interface IRequest {
  email: string;
  password: string;
}

interface IResponse {
  user: {
    name: string;
    email: string;
    role: UserRole;
    id: number;
    addresses: AddressDates[];
  };
  token: string;
  refreshToken: string;
}

@injectable()
export class AuthenticateUserUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
    @inject("UserTokensRepository")
    private userTokensRepository: IUsersTokensRepository
  ) {}

  async execute({ email, password }: IRequest): Promise<IResponse> {
    const user = await this.usersRepository.findByEmail(email);

    const {
      expires_in_token,
      secret_token,
      secret_refresh_token,
      expires_in_refresh_token,
    } = auth;

    if (!user) {
      throw new AppError({
        message: "Email ou senha incorretos",
        statusCode: 401,
      });
    }

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      throw new AppError({ message: "Email ou senha incorretos" });
    }

    const tokenOptions: SignOptions = {
      subject: String(user.id),
      expiresIn: expires_in_token as SignOptions["expiresIn"],
    };

    const refreshTokenOptions: SignOptions = {
      subject: String(user.id),
      expiresIn: expires_in_refresh_token as SignOptions["expiresIn"],
    };

    const token = sign({ role: user.role }, secret_token, tokenOptions);

    const refreshToken = sign(
      { role: user.role },
      secret_refresh_token,
      refreshTokenOptions
    );

    await this.userTokensRepository.create({
      user_id: user.id,
      refresh_token: refreshToken,
      expires_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const tokenReturn: IResponse = {
      token,
      refreshToken,
      user: {
        name: user.username,
        email: user.email,
        role: user.role,
        id: user.id,
        addresses: user.addresses,
      },
    };

    return tokenReturn;
  }
}
