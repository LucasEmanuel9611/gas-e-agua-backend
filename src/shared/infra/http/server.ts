import "reflect-metadata";
import { LoggerService } from "../../services/LoggerService";
import { queueManager } from "../queues/QueueManager";
import { runScheduledTasks } from "../tasks";
import { app, port } from "./app";

const server = app.listen(port, async () => {
  LoggerService.info(`🚀 Server is running on port ${port}`, {
    port,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });

  // Inicializar workers das filas
  await queueManager.initializeWorkers();

  // Inicializar tarefas agendadas
  runScheduledTasks();
});

process.on("SIGTERM", async () => {
  LoggerService.info("SIGTERM received, shutting down gracefully");

  // Finalizar workers das filas
  await queueManager.shutdownWorkers();

  server.close(() => {
    LoggerService.info("Process terminated");
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  LoggerService.info("SIGINT received, shutting down gracefully");

  // Finalizar workers das filas
  await queueManager.shutdownWorkers();

  server.close(() => {
    LoggerService.info("Process terminated");
    process.exit(0);
  });
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
