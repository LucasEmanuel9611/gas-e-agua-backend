import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";
import { validateSchema } from "@shared/utils/schema";

import { sendNotificationSchema } from "./schemas/sendNotificationSchema";
import { SendNotificationUseCase } from "./sendNotificationUseCase";

export class SendNotificationController {
  private sendNotificationUseCase = container.resolve(SendNotificationUseCase);

  async sendSingleNotification(
    request: Request,
    response: Response
  ): Promise<Response> {
    try {
      const data = validateSchema(sendNotificationSchema, request.body);

      const result = await this.sendNotificationUseCase.sendSingleNotification({
        userId: data.userId,
        templateId: data.templateId,
        customData: data.customData,
        priority: data.priority,
      });

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
      const data = request.body;

      const result = await this.sendNotificationUseCase.sendBulkNotification({
        templateId: data.templateId,
        targetUsers: data.targetUsers,
        targetRoles: data.targetRoles,
        customData: data.customData,
        priority: data.priority,
      });

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

  async sendScheduledNotification(
    request: Request,
    response: Response
  ): Promise<Response> {
    try {
      const data = request.body;

      const result =
        await this.sendNotificationUseCase.sendScheduledNotification({
          templateId: data.templateId,
          scheduledFor: new Date(data.scheduledFor),
          targetUsers: data.targetUsers,
          targetRoles: data.targetRoles,
          customData: data.customData,
          priority: data.priority,
        });

      return response.status(202).json({
        success: result.success,
        sent: result.sent,
        failed: result.failed,
        total: result.total,
        jobId: result.jobId,
        scheduledFor: result.scheduledFor,
        errors: result.errors,
      });
    } catch (error) {
      return handleControllerError(error, response);
    }
  }

  async sendOrderNotification(
    request: Request,
    response: Response
  ): Promise<Response> {
    try {
      const { orderId, userId, notificationType, status, customData } =
        request.body;

      const result = await this.sendNotificationUseCase.sendOrderNotification(
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

  async sendPromotionNotification(
    request: Request,
    response: Response
  ): Promise<Response> {
    try {
      const { promotionId, targetUsers, targetRoles, customData, priority } =
        request.body;

      const result =
        await this.sendNotificationUseCase.sendPromotionNotification(
          promotionId,
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

  async sendBirthdayNotification(
    request: Request,
    response: Response
  ): Promise<Response> {
    try {
      const { userId, customData } = request.body;

      const result =
        await this.sendNotificationUseCase.sendBirthdayNotification(
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
