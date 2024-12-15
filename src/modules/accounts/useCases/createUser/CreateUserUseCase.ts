import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { ICreateUserDTO } from "@modules/accounts/types";
import { hash } from "bcrypt";
import { inject, injectable } from "tsyringe";

import { AppError } from "@shared/errors/AppError";

@injectable()
export class CreateUserUseCase {
  constructor(
    @inject("UsersRepository")
    private usersRepository: IUsersRepository
  ) {}

  async execute({
    username,
    email,
    password,
    telephone,
  }: ICreateUserDTO): Promise<void> {
    const userAlreadyExists = await this.usersRepository.findByEmail(email);

    if (userAlreadyExists) {
      throw new AppError("O usuário já existe!");
    }

    if (!username || password.length < 3) {
      throw new AppError("Nome de usuário inválido");
    }

    if (!password || password?.length < 6) {
      throw new AppError("A senha deve ter seis digitos ou mais");
    }

    if (!telephone || !(telephone?.length === 11)) {
      throw new AppError("Número de telefone inválido");
    }

    if (!username && username?.length < 3) {
      throw new AppError("Nome de usuário Inválido");
    }

    const passwordHash = await hash(password, 8);

    await this.usersRepository.create({
      username,
      email,
      password: passwordHash,
      telephone,
    });
  }
}
