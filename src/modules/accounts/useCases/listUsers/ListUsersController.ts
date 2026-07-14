import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";

import { ListUsersUseCase } from "./ListUsersUseCase";

export class ListUsersController {
  handle = async (request: Request, response: Response) => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        sort = "highest_debt_first",
      } = request.query;

      const listUsersUseCase = container.resolve(ListUsersUseCase);

      const result = await listUsersUseCase.execute({
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        sort: sort as "highest_debt_first" | "name_asc",
      });

      return response.json(result);
    } catch (err) {
      return handleControllerError(err, response);
    }
  };
}
