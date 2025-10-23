import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";

import { DeleteAddressUseCase } from "./deleteAddressUseCase";

export class DeleteAddressController {
  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const { id: userId } = request.user;
      const { addressId } = request.params;

      const deleteAddressUseCase = container.resolve(DeleteAddressUseCase);

      await deleteAddressUseCase.execute(
        parseInt(userId, 10),
        parseInt(addressId, 10)
      );

      return response.status(204).send();
    } catch (error) {
      return handleControllerError(error, response);
    }
  }
}
