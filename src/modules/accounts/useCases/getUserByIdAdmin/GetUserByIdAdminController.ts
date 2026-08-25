import { GetUserByIdAdminUseCase } from "@modules/accounts/useCases/getUserByIdAdmin/GetUserByIdAdminUseCase";
import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";

export class GetUserByIdAdminController {
  handle = async (request: Request, response: Response) => {
    try {
      const { userId } = request.params;

      const getUserByIdAdminUseCase = container.resolve(
        GetUserByIdAdminUseCase
      );

      const user = await getUserByIdAdminUseCase.execute(Number(userId));

      return response.json(user);
    } catch (error) {
      return handleControllerError(error, response);
    }
  };
}
