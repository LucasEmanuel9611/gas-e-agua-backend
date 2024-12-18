import { Request, Response } from "express";
import "reflect-metadata";
import { container } from "tsyringe";

import { CreateUserUseCase } from "./CreateUserUseCase";

export class CreateUserController {
  async handle(req: Request, res: Response) {
    const { username, email, password, telephone, address } = req.body;

    const createUserUseCase = container.resolve(CreateUserUseCase);

    await createUserUseCase.execute({
      username,
      email,
      password,
      telephone,
      address,
    });

    return res.status(201).send({
      username,
      email,
      password,
    });
  }
}
