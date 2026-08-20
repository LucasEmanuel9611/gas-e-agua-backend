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
      const result = await expoPushService.sendPushToAdmins({
        title,
        body: message,
        data: { notificationType: "admin_notification" },
      });

      if (result.sent === 0) {
        return response.status(400).json({ error: "No valid tokens found" });
      }

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
