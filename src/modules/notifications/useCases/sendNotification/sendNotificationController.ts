import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";

import { SendNotificationUseCase } from "./sendNotificationUseCase";

export class SendNotificationController {
  async sendOrderNotification(
    request: Request,
    response: Response
  ): Promise<Response> {
    try {
      const sendNotificationUseCase = container.resolve(
        SendNotificationUseCase
      );

      const { orderId, userId, notificationType, status, customData } =
        request.body;

      const result = await sendNotificationUseCase.sendOrderNotification(
        orderId,
        userId,
        notificationType,
        status,
        customData
      );

      return response.status(202).json({
        success: result.success,
        sent: result.sent,
        failed: result.failed,
        total: result.total,
        jobId: result.jobId,
        errors: result.errors,
      });
    } catch (error) {
      return handleControllerError(error, response);
    }
  }

  async sendBulkNotification(
    request: Request,
    response: Response
  ): Promise<Response> {
    try {
      const sendNotificationUseCase = container.resolve(
        SendNotificationUseCase
      );

      const { templateId, targetUsers, targetRoles, customData, priority } =
        request.body;

      const result = await sendNotificationUseCase.sendBulkNotification(
        templateId,
        targetUsers,
        targetRoles,
        customData,
        priority
      );

      return response.status(202).json({
        success: result.success,
        sent: result.sent,
        failed: result.failed,
        total: result.total,
        jobId: result.jobId,
        errors: result.errors,
      });
    } catch (error) {
      return handleControllerError(error, response);
    }
  }

  async sendBroadcastToUsers(
    request: Request,
    response: Response
  ): Promise<Response> {
    try {
      const sendNotificationUseCase = container.resolve(
        SendNotificationUseCase
      );

      const { title, message } = request.body;

      const result = await sendNotificationUseCase.sendBroadcastToUsers(
        title,
        message
      );

      return response.status(202).json({
        success: result.success,
        sent: result.sent,
        failed: result.failed,
        total: result.total,
        jobId: result.jobId,
        errors: result.errors,
      });
    } catch (error) {
      return handleControllerError(error, response);
    }
  }

  async sendBirthdayNotification(
    request: Request,
    response: Response
  ): Promise<Response> {
    try {
      const sendNotificationUseCase = container.resolve(
        SendNotificationUseCase
      );

      const { userId, customData } = request.body;

      const result = await sendNotificationUseCase.sendBirthdayNotification(
        userId,
        customData
      );

      return response.status(202).json({
        success: result.success,
        sent: result.sent,
        failed: result.failed,
        total: result.total,
        jobId: result.jobId,
        errors: result.errors,
      });
    } catch (error) {
      return handleControllerError(error, response);
    }
  }
}
