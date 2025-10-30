import { QueueController } from "@modules/notifications/controllers/QueueController";
import { notificationQueue } from "@modules/notifications/infra/queues/NotificationQueue";
import { CleanInvalidTokensController } from "@modules/notifications/useCases/cleanInvalidTokens/cleanInvalidTokensController";
import { GetUserNotificationHistoryController } from "@modules/notifications/useCases/getUserNotificationHistory/getUserNotificationHistoryController";
import { ManageScheduledNotificationsController } from "@modules/notifications/useCases/manageScheduledNotifications/manageScheduledNotificationsController";
import { SendNotificationController } from "@modules/notifications/useCases/sendNotification/sendNotificationController";
import { Router } from "express";

import { ensureAdmin } from "@shared/infra/http/middlewares/ensureAdmin";
import { ensureAuthenticated } from "@shared/infra/http/middlewares/ensureAuthenticated";

const notificationsRoutes = Router();
const sendNotificationController = new SendNotificationController();
const queueController = new QueueController();
const cleanInvalidTokensController = new CleanInvalidTokensController();
const manageScheduledController = new ManageScheduledNotificationsController();
const historyController = new GetUserNotificationHistoryController();

notificationsRoutes.use(ensureAuthenticated);

// Endpoint usado internamente pelos UseCases de pagamento
notificationsRoutes.post(
  "/send/order",
  sendNotificationController.sendOrderNotification
);

// Endpoint público de estatísticas rápidas
notificationsRoutes.get("/stats", async (req, res) => {
  try {
    const stats = await notificationQueue.getJobCounts();
    const isPaused = await notificationQueue.isPaused();

    return res.status(200).json({
      queue: {
        name: notificationQueue.name,
        paused: isPaused,
        waiting: stats.waiting,
        active: stats.active,
        completed: stats.completed,
        failed: stats.failed,
        delayed: stats.delayed,
      },
      health: {
        status: stats.active > 0 || stats.waiting > 0 ? "processing" : "idle",
        hasFailures: stats.failed > 0,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to get notification stats",
      message: error instanceof Error ? error.message : String(error),
    });
  }
});

// Histórico de notificações do próprio usuário
notificationsRoutes.get("/history", historyController.handleMyHistory);

// Endpoints admin: Todos abaixo só podem ser acessados por admins
notificationsRoutes.use(ensureAdmin);

// Histórico de notificações de qualquer usuário (admin)
notificationsRoutes.get("/history/:userId", historyController.handle);

// Limpeza de tokens
notificationsRoutes.post("/tokens/clean", cleanInvalidTokensController.handle);

// Agendamento de notificações
notificationsRoutes.post("/scheduled", manageScheduledController.create);
notificationsRoutes.get("/scheduled", manageScheduledController.findAll);
notificationsRoutes.get("/scheduled/:id", manageScheduledController.findById);
notificationsRoutes.put("/scheduled/:id", manageScheduledController.update);
notificationsRoutes.delete("/scheduled/:id", manageScheduledController.delete);
notificationsRoutes.post(
  "/scheduled/:id/activate",
  manageScheduledController.activate
);
notificationsRoutes.post(
  "/scheduled/:id/deactivate",
  manageScheduledController.deactivate
);

// Endpoints para aniversário e bulk
notificationsRoutes.post(
  "/send/bulk",
  sendNotificationController.sendBulkNotification
);
notificationsRoutes.post(
  "/send/birthday",
  sendNotificationController.sendBirthdayNotification
);

// Endpoints admin para monitoramento da fila
notificationsRoutes.get("/queue/stats", queueController.getQueueStats);
notificationsRoutes.get("/queue/jobs", queueController.getJobs);
notificationsRoutes.get("/queue/jobs/:jobId", queueController.getJob);
notificationsRoutes.post("/queue/pause", queueController.pauseQueue);
notificationsRoutes.post("/queue/resume", queueController.resumeQueue);
notificationsRoutes.post("/queue/clean", queueController.cleanQueue);
notificationsRoutes.post("/queue/jobs/:jobId/retry", queueController.retryJob);
notificationsRoutes.delete("/queue/jobs/:jobId", queueController.removeJob);

export { notificationsRoutes };
