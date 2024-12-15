import { Request, Response } from "express";
import { container } from "tsyringe";

import { ListOrdersByUserUseCase } from "./ListOrdersByUserUseCase";

export class ListOrdersByUserController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { id } = request.user;

    const listOrdersByUserUseCase = container.resolve(ListOrdersByUserUseCase);

    const Orders = await listOrdersByUserUseCase.execute(id);

    return response.json(Orders);
  }
}
