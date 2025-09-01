import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";
import { validateSchema } from "@shared/utils/schema";

import { updateAddonSchema } from "./schema";
import { UpdateAddonUseCase } from "./UpdateAddonUseCase";

export class UpdateAddonController {
  async handle(req: Request, res: Response) {
    try {
      const { name, value } = validateSchema(updateAddonSchema, req.body);
      const { id } = req.params;

      const updateAddonUseCase = container.resolve(UpdateAddonUseCase);

      const updatedAddon = await updateAddonUseCase.execute({
        id: Number(id),
        newData: { name, value },
      });

      return res.status(201).send(updatedAddon);
    } catch (error) {
      return handleControllerError(error, res);
    }
  }
}
