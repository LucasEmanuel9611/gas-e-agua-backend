import "reflect-metadata";

import { port } from "./shared/infra/http/app";
import { createHttpApplication } from "./shared/infra/http/create-http-application";
import { queueManager } from "./shared/infra/queues/QueueManager";
import { runScheduledTasks } from "./shared/infra/tasks";
import { LoggerService } from "./shared/services/LoggerService";

async function bootstrap() {
  const nestApplication = await createHttpApplication();

  await nestApplication.listen(port);

  LoggerService.info(`🚀 Server is running on port ${port}`, {
    port,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });

  await queueManager.initializeWorkers();
  runScheduledTasks();
}

bootstrap();

process.on("SIGTERM", async () => {
  LoggerService.info("SIGTERM received, shutting down gracefully");
  await queueManager.shutdownWorkers();
  process.exit(0);
});

process.on("SIGINT", async () => {
  LoggerService.info("SIGINT received, shutting down gracefully");
  await queueManager.shutdownWorkers();
  process.exit(0);
});

process.on("unhandledRejection", (reason, promise) => {
  LoggerService.error("Unhandled Rejection at:", new Error(String(reason)), {
    promise: promise.toString(),
  });
});

process.on("uncaughtException", (error) => {
  LoggerService.error("Uncaught Exception:", error);
  process.exit(1);
});
