import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";

import { GetRevenueMetricsUseCase } from "./GetRevenueMetricsUseCase";

export class GetRevenueMetricsController {
  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const getRevenueMetricsUseCase = container.resolve(
        GetRevenueMetricsUseCase
      );

      const { startDate, endDate } = req.query;

      const metrics = await getRevenueMetricsUseCase.execute(
        startDate as string | undefined,
        endDate as string | undefined
      );

      return res.status(200).json(metrics);
    } catch (error) {
      return handleControllerError(error, res);
    }
  }
}
