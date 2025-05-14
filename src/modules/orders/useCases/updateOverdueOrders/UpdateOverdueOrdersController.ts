// controllers/UpdateOverdueOrdersController.ts
import { Request, Response } from "express";
import { container } from "tsyringe";

import { UpdateOverdueOrdersUseCase } from "./updateOverdueOrdersUseCase";

export class UpdateOverdueOrdersController {
  async handle(_: Request, response: Response): Promise<Response> {
    const listOrdersByDayUseCase = container.resolve(
      UpdateOverdueOrdersUseCase
    );

    const updatedCount = await listOrdersByDayUseCase.execute();

    return response.status(200).json({ updated: updatedCount });
  }
}
