import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";

import { GetStockMetricsUseCase } from "./GetStockMetricsUseCase";

export class GetStockMetricsController {
  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const getStockMetricsUseCase = container.resolve(GetStockMetricsUseCase);

      const { type } = req.query;

      const metrics = await getStockMetricsUseCase.execute(
        type as string | undefined
      );

      return res.status(200).json(metrics);
    } catch (error) {
      return handleControllerError(error, res);
    }
  }
}

