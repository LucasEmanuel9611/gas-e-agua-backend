import { Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";

import { GetDeliveryDaySummaryUseCase } from "./GetDeliveryDaySummaryUseCase";

export class GetDeliveryDaySummaryController {
  handle = async (_, response: Response): Promise<Response> => {
    try {
      const getDeliveryDaySummaryUseCase = container.resolve(
        GetDeliveryDaySummaryUseCase
      );

      const summaryData = await getDeliveryDaySummaryUseCase.execute();

      return response.status(200).json(summaryData);
    } catch (error) {
      return handleControllerError(error, response);
    }
  };
}
