import { QueueController } from "@modules/notifications/controllers/QueueController";
import { SendNotificationController } from "@modules/notifications/useCases/sendNotification/sendNotificationController";
import { Router } from "express";

import { ensureAdmin } from "@shared/infra/http/middlewares/ensureAdmin";
import { ensureAuthenticated } from "@shared/infra/http/middlewares/ensureAuthenticated";

const notificationsRoutes = Router();
const sendNotificationController = new SendNotificationController();
const queueController = new QueueController();

notificationsRoutes.use(ensureAuthenticated);

notificationsRoutes.post(
  "/send/single",
  sendNotificationController.sendSingleNotification
);
notificationsRoutes.post(
  "/send/bulk",
  sendNotificationController.sendBulkNotification
);
notificationsRoutes.post(
  "/send/scheduled",
  sendNotificationController.sendScheduledNotification
);
notificationsRoutes.post(
  "/send/order",
  sendNotificationController.sendOrderNotification
);
notificationsRoutes.post(
  "/send/promotion",
  sendNotificationController.sendPromotionNotification
);
notificationsRoutes.post(
  "/send/birthday",
  sendNotificationController.sendBirthdayNotification
);

notificationsRoutes.use(ensureAdmin);

notificationsRoutes.get("/queue/stats", queueController.getQueueStats);
notificationsRoutes.get("/queue/jobs", queueController.getJobs);
notificationsRoutes.get("/queue/jobs/:jobId", queueController.getJob);
notificationsRoutes.post("/queue/pause", queueController.pauseQueue);
notificationsRoutes.post("/queue/resume", queueController.resumeQueue);
notificationsRoutes.post("/queue/clean", queueController.cleanQueue);
notificationsRoutes.post("/queue/jobs/:jobId/retry", queueController.retryJob);
notificationsRoutes.delete("/queue/jobs/:jobId", queueController.removeJob);

export { notificationsRoutes };
