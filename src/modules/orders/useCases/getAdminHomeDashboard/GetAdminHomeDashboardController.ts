import { Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";

import { GetAdminHomeDashboardUseCase } from "./GetAdminHomeDashboardUseCase";

export class GetAdminHomeDashboardController {
  handle = async (_, response: Response): Promise<Response> => {
    try {
      const getAdminHomeDashboardUseCase = container.resolve(
        GetAdminHomeDashboardUseCase
      );

      const dashboardData = await getAdminHomeDashboardUseCase.execute();

      return response.status(200).json(dashboardData);
    } catch (error) {
      return handleControllerError(error, response);
    }
  };
}
