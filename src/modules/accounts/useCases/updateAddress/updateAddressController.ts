import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";

import { UpdateAddressUseCase } from "./updateAddressUseCase";

export class UpdateAddressController {
  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const { id: userId } = request.user;
      const { addressId } = request.params;
      const address = request.body;

      const updateAddressUseCase = container.resolve(UpdateAddressUseCase);

      const updatedAddress = await updateAddressUseCase.execute({
        userId: Number(userId),
        addressId: Number(addressId),
        address,
      });

      return response.status(200).json(updatedAddress);
    } catch (error) {
      return handleControllerError(error, response);
    }
  }
}
