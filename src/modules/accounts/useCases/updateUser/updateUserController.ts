import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";
import { validateSchema } from "@shared/utils/schema";

import { updateUserSchema } from "./schema";
import { UpdateUserUseCase } from "./updateUserUsecase";

export class UpdateUserController {
  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const { id } = request.user;
      const data = validateSchema(updateUserSchema, request.body);

      const updateUserUseCase = container.resolve(UpdateUserUseCase);
      const user = await updateUserUseCase.execute({ id: Number(id), ...data });

      return response.json(user);
    } catch (error) {
      return handleControllerError(error, response);
    }
  }
}
