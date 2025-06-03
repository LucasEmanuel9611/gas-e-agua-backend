import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";

import { ProfileUserUseCase } from "./ProfileUserUsecase";

export class ProfileUserController {
  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const { id } = request.user;

      const profileUserUseCase = container.resolve(ProfileUserUseCase);
      const user = await profileUserUseCase.execute(Number(id));

      return response.json(user);
    } catch (error) {
      return handleControllerError(error, response);
    }
  }
}
