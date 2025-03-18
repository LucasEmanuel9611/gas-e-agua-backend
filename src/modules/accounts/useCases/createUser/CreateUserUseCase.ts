import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { createUserSchema } from "@modules/accounts/schemas";
import { ICreateUserDTO } from "@modules/accounts/types";
import { hash } from "bcrypt";
import { inject, injectable } from "tsyringe";
import { z } from "zod";

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
    address,
  }: ICreateUserDTO): Promise<void> {
    try {
      createUserSchema.parse({ username, email, password, telephone, address });

      const userAlreadyExists = await this.usersRepository.findByEmail(email);

      if (userAlreadyExists) {
        throw new AppError("O usuário já existe!");
      }

      const passwordHash = await hash(password, 8);

      await this.usersRepository.create({
        username,
        email,
        password: passwordHash,
        telephone,
        address,
      });
    } catch (error) {
      console.log({ error });
      if (error instanceof z.ZodError) {
        throw new AppError(error.errors[0].message);
      }
      throw error;
    }
  }
}
