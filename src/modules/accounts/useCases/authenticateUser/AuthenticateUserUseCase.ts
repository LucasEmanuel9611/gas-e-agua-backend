import auth from "@config/auth";
import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { AddressDates, UserRole } from "@modules/accounts/types";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";
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
}

@injectable()
export class AuthenticateUserUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository
  ) {}

  async execute({ email, password }: IRequest): Promise<IResponse> {
    const user = await this.usersRepository.findByEmail(email);

    const { expires_in_token, secret_token } = auth;

    if (!user) {
      throw new AppError("Email ou senha incorretos", 401);
    }

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      throw new AppError("Email ou senha incorretos");
    }

    const token = sign({}, secret_token, {
      subject: String(user.id),
      expiresIn: expires_in_token,
    });

    const tokenReturn: IResponse = {
      token,
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
