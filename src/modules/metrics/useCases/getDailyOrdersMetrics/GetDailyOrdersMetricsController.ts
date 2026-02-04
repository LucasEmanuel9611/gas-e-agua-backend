import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";

import { GetDailyOrdersMetricsUseCase } from "./GetDailyOrdersMetricsUseCase";

export class GetDailyOrdersMetricsController {
  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const getDailyOrdersMetricsUseCase = container.resolve(
        GetDailyOrdersMetricsUseCase
      );

      const { date } = req.query;

      const metrics = await getDailyOrdersMetricsUseCase.execute(
        date as string | undefined
      );

      return res.status(200).json(metrics);
    } catch (error) {
      return handleControllerError(error, res);
    }
  }
}
