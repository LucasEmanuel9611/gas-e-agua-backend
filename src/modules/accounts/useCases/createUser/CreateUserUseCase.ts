import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { ICreateUserDTO } from "@modules/accounts/types";
import { Inject, Injectable } from "@nestjs/common";
import { hash } from "bcrypt";

import { AppError } from "@shared/errors/AppError";

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject("UsersRepository")
    private usersRepository: IUsersRepository
  ) {}

  async execute({
    username,
    email,
    password,
    telephone,
    address,
  }: ICreateUserDTO): Promise<void> {
    const userAlreadyExists = await this.usersRepository.findByEmail(email);

    if (userAlreadyExists) {
      throw new AppError({ message: "O usuário já existe!" });
    }

    const passwordHash = await hash(password, 8);

    await this.usersRepository.create({
      username,
      email,
      password: passwordHash,
      telephone,
      address,
    });
  }
}
