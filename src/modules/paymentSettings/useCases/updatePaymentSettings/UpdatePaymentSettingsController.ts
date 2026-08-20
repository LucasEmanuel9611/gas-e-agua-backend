import { updatePaymentSettingsSchema } from "@modules/paymentSettings/useCases/updatePaymentSettings/schema";
import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";
import { validateSchema } from "@shared/utils/schema";

import { UpdatePaymentSettingsUseCase } from "./UpdatePaymentSettingsUseCase";

export class UpdatePaymentSettingsController {
  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const { pix_key, recipient_name } = validateSchema(
        updatePaymentSettingsSchema,
        req.body
      );

      const updatePaymentSettingsUseCase = container.resolve(
        UpdatePaymentSettingsUseCase
      );

      const paymentSettings = await updatePaymentSettingsUseCase.execute({
        pix_key,
        recipient_name,
      });

      return res.status(200).json(paymentSettings);
    } catch (error) {
      return handleControllerError(error, res);
    }
  }
}
