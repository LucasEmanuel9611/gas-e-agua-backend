import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";
import { validateSchema } from "@shared/utils/schema";

import { CreateAddonUseCase } from "./CreateAddonUseCase";
import { createAddonSchema } from "./schema";

export class CreateAddonController {
  async handle(req: Request, res: Response) {
    try {
      const { name, value } = validateSchema(createAddonSchema, req.body);

      const createAddonUseCase = container.resolve(CreateAddonUseCase);

      const addon = await createAddonUseCase.execute({ name, value });

      return res.status(201).send(addon);
    } catch (error) {
      return handleControllerError(error, res);
    }
  }
}
