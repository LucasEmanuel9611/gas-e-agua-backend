import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";

import { GetPaymentSettingsUseCase } from "./GetPaymentSettingsUseCase";

export class GetPaymentSettingsController {
  async handle(_: Request, res: Response): Promise<Response> {
    try {
      const getPaymentSettingsUseCase = container.resolve(
        GetPaymentSettingsUseCase
      );

      const paymentSettings = await getPaymentSettingsUseCase.execute();

      return res.status(200).json(paymentSettings);
    } catch (error) {
      return handleControllerError(error, res);
    }
  }
}
