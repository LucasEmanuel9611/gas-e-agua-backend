import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";

import { FindAddonsUseCase } from "./FindAddonsUseCase";

export class FindAddonsController {
  async handle(req: Request, res: Response) {
    try {
      const findAddonsUseCase = container.resolve(FindAddonsUseCase);

      const addons = await findAddonsUseCase.execute();

      return res.status(200).send(addons);
    } catch (error) {
      return handleControllerError(error, res);
    }
  }
}
