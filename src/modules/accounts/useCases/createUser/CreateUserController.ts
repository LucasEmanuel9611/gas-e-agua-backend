import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";
import { validateSchema } from "@shared/utils/schema";

import { CreateUserUseCase } from "./CreateUserUseCase";
import { createUserSchema } from "./schemas";

export class CreateUserController {
  async handle(req: Request, res: Response) {
    try {
      const { username, email, password, telephone, address } = validateSchema(
        createUserSchema,
        req.body
      );

      const createUserUseCase = container.resolve(CreateUserUseCase);

      await createUserUseCase.execute({
        username,
        email,
        password,
        telephone,
        address: {
          street: address.street,
          number: address.number,
          local: address.local,
          reference: address.reference,
        },
      });

      return res.status(201).send({
        username,
        email,
        password,
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }
}
