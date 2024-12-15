import { Request, Response } from "express";
import { container } from "tsyringe";

import { ListOrdersHoursByDayUseCase } from "./ListOrdersHoursByDayUseCase";

export class ListOrdersHoursByDayController {
  async handle(request: Request, response: Response): Promise<Response> {
    const { date } = request.query;

    const listOrdersByDayUseCase = container.resolve(
      ListOrdersHoursByDayUseCase
    );

    if (date && typeof date === "string") {
      const allDayOrders = await listOrdersByDayUseCase.execute(date);
      return response.json(allDayOrders);
    }

    return response.status(400).json({ error: "Invalid data" });
  }
}
