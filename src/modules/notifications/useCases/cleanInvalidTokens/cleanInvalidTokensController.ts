import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";

import { CleanInvalidTokensUseCase } from "./cleanInvalidTokensUseCase";

export class CleanInvalidTokensController {
  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const { olderThanDays } = request.query;

      const cleanInvalidTokensUseCase = container.resolve(
        CleanInvalidTokensUseCase
      );

      const result = await cleanInvalidTokensUseCase.execute(
        olderThanDays ? Number(olderThanDays) : undefined
      );

      return response.status(200).json({
        message: "Limpeza de tokens concluída",
        tokensRemoved: result.tokensRemoved,
        usersAffected: result.usersAffected,
        hasErrors: result.errors.length > 0,
        errors: result.errors,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return handleControllerError(error, response);
    }
  }
}
