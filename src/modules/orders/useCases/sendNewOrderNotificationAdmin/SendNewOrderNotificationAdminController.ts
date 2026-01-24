import { ListAdminUserUseCase } from "@modules/accounts/useCases/listAdminUser/ListAdminUserUseCase";
import { ExpoPushService } from "@modules/notifications/services/ExpoPushService";
import { Request, Response } from "express";
import { container } from "tsyringe";

import { handleControllerError } from "@shared/utils/controller";
import { validateSchema } from "@shared/utils/schema";

import { sendNotificationSchema } from "./schema";

export class SendNewOrderNotificationAdminController {
  async handle(request: Request, response: Response) {
    try {
      const { title, message } = validateSchema(
        sendNotificationSchema,
        request.body
      );

      const expoPushService = container.resolve(ExpoPushService);
      const listAdminUserUseCase = container.resolve(ListAdminUserUseCase);
      const adminUser = await listAdminUserUseCase.execute();

      const tokens = adminUser.notificationTokens
        .filter((t) => t.is_valid !== false)
        .map((t) => t.token);

      if (tokens.length === 0) {
        return response.status(400).json({ error: "No valid tokens found" });
      }

      const result = await expoPushService.sendPushNotification({
        to: tokens,
        title,
        body: message,
        data: { notificationType: "admin_notification" },
      });

      return response.status(200).json({
        sent: result.sent,
        failed: result.failed,
        total: result.total,
      });
    } catch (error) {
      return handleControllerError(error, response);
    }
  }
}
