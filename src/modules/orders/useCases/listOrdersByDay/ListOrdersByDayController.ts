import { Request, Response } from "express";
import { container } from "tsyringe";

import { ListOrdersByDayUseCase } from "./ListOrdersByDayUseCase";

export class ListOrdersByDayController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { date } = request.query;

    const listOrdersByDayUseCase = container.resolve(ListOrdersByDayUseCase);

    if (date && typeof date === "string") {
      const Orders = await listOrdersByDayUseCase.execute(date);
      return response.json(Orders);
    }
    return response.status(400).json({ error: "Invalid data" });
  }
}
