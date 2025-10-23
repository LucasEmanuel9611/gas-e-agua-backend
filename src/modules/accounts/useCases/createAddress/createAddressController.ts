import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";

import { CreateAddressUseCase } from "./createAddressUseCase";

export class CreateAddressController {
  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const { id: userId } = request.user;
      const address = request.body;

      const createAddressUseCase = container.resolve(CreateAddressUseCase);

      const createdAddress = await createAddressUseCase.execute({
        userId: parseInt(userId, 10),
        address,
      });

      return response.status(201).json(createdAddress);
    } catch (error) {
      return handleControllerError(error, response);
    }
  }
}
