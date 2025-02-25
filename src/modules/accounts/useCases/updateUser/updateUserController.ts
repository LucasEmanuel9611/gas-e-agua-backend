import { IUpdateUserDTO } from "@modules/accounts/types";
import { Request, Response } from "express";
import { container } from "tsyringe";

import { UpdateUserUseCase } from "./updateUserUsecase";

export class UpdateUserController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { id } = request.user;
    const data = request.body as IUpdateUserDTO;

    const updateUserUseCase = container.resolve(UpdateUserUseCase);
    const user = await updateUserUseCase.execute({ id, ...data });

    return response.json(user);
  }
}
