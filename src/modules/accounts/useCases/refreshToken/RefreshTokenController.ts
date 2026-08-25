import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";

import { RefreshTokenUseCase } from "./RefreshTokenUseCase";

export class RefreshTokenController {
  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const { refreshToken } = request.body;

      const refreshTokenUseCase = container.resolve(RefreshTokenUseCase);

      const result = await refreshTokenUseCase.execute({ refreshToken });

      return response.status(200).json(result);
    } catch (error) {
      return handleControllerError(error, response);
    }
  }
}
