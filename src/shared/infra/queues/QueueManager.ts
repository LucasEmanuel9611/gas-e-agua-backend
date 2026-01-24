import { NotificationWorker } from "@modules/notifications/infra/queues/workers/NotificationWorker";
import { container } from "tsyringe";

import { LoggerService } from "@shared/services/LoggerService";

export class QueueManager {
  private workers: NotificationWorker[] = [];

  async initializeWorkers(): Promise<void> {
    try {
      LoggerService.info("🚀 Inicializando workers das filas...");

      // Inicializar NotificationWorker
      const notificationWorker = container.resolve(NotificationWorker);
      this.workers.push(notificationWorker);

      LoggerService.info(
        `✅ ${this.workers.length} workers inicializados com sucesso`
      );
    } catch (error) {
      LoggerService.error("❌ Erro ao inicializar workers:", error);
      throw error;
    }
  }

  async shutdownWorkers(): Promise<void> {
    try {
      LoggerService.info("🛑 Finalizando workers das filas...");

      await Promise.all(
        this.workers.map(async (worker) => {
          await worker.close();
        })
      );

      LoggerService.info("✅ Todos os workers foram finalizados");
    } catch (error) {
      LoggerService.error("❌ Erro ao finalizar workers:", error);
      throw error;
    }
  }

  getWorkers(): NotificationWorker[] {
    return this.workers;
  }
}

export const queueManager = new QueueManager();
