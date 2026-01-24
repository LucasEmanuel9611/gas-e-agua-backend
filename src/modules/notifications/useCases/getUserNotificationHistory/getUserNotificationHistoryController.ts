import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";

import { NotificationStatus } from "../../types/notificationHistory";
import { GetUserNotificationHistoryUseCase } from "./getUserNotificationHistoryUseCase";

export class GetUserNotificationHistoryController {
  async handle(request: Request, response: Response): Promise<Response> {
    try {
      const { userId } = request.params;
      const { type, status, startDate, endDate, page, limit } = request.query;

      const getUserNotificationHistoryUseCase = container.resolve(
        GetUserNotificationHistoryUseCase
      );

      const result = await getUserNotificationHistoryUseCase.execute(
        Number(userId),
        {
          type: type as string | undefined,
          status: status as NotificationStatus | undefined,
          startDate: startDate ? new Date(startDate as string) : undefined,
          endDate: endDate ? new Date(endDate as string) : undefined,
          page: page ? Number(page) : undefined,
          limit: limit ? Number(limit) : undefined,
        }
      );

      return response.status(200).json(result);
    } catch (error) {
      return handleControllerError(error, response);
    }
  }

  async handleMyHistory(
    request: Request,
    response: Response
  ): Promise<Response> {
    try {
      const userId = Number(request.user.id);
      const { type, status, startDate, endDate, page, limit } = request.query;

      const getUserNotificationHistoryUseCase = container.resolve(
        GetUserNotificationHistoryUseCase
      );

      const result = await getUserNotificationHistoryUseCase.execute(userId, {
        type: type as string | undefined,
        status: status as NotificationStatus | undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      return response.status(200).json(result);
    } catch (error) {
      return handleControllerError(error, response);
    }
  }
}
