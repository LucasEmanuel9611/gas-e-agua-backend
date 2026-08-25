import { Job, Worker, WorkerOptions } from "bullmq";

import { LoggerService } from "@shared/services/LoggerService";

import { redisConnection } from "../redis/redisConnection";

export interface IWorkerProcessor<T = any> {
  (job: Job<T>): Promise<void>;
}

export class BaseWorker<T = any> {
  public worker: Worker<T>;
  private workerName: string;
  private queueName: string;

  constructor(
    queueName: string,
    processor: IWorkerProcessor<T>,
    opts?: WorkerOptions
  ) {
    this.queueName = queueName;
    this.workerName = `${queueName}-worker`;

    this.worker = new Worker<T>(
      queueName,
      async (job) => {
        try {
          LoggerService.info(`Processing job ${job.id} in ${this.workerName}`);
          await processor(job);
          LoggerService.info(
            `Job ${job.id} processed successfully in ${this.workerName}`
          );
        } catch (error) {
          LoggerService.error(
            `Error processing job ${job.id} in ${this.workerName}:`,
            error
          );
          throw error;
        }
      },
      {
        connection: redisConnection,
        concurrency: 5,
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
        ...opts,
      }
    );

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.worker.on("ready", () => {
      LoggerService.info(`Worker ${this.workerName} is ready`);
    });

    this.worker.on("error", (error) => {
      LoggerService.error(`Worker ${this.workerName} error:`, error);
    });

    this.worker.on("failed", (job, error) => {
      LoggerService.error(
        `Job ${job?.id} failed in worker ${this.workerName}:`,
        error
      );
    });

    this.worker.on("stalled", (jobId) => {
      LoggerService.warn(`Job ${jobId} stalled in worker ${this.workerName}`);
    });

    this.worker.on("completed", (job) => {
      LoggerService.info(
        `Job ${job.id} completed in worker ${this.workerName}`
      );
    });

    this.worker.on("active", (job) => {
      LoggerService.info(`Job ${job.id} started in worker ${this.workerName}`);
    });

    this.worker.on("closing", () => {
      LoggerService.info(`Worker ${this.workerName} is closing`);
    });

    this.worker.on("closed", () => {
      LoggerService.info(`Worker ${this.workerName} closed`);
    });
  }

  async close(): Promise<void> {
    await this.worker.close();
    LoggerService.info(`Worker ${this.workerName} closed`);
  }

  get name(): string {
    return this.workerName;
  }

  get queue(): string {
    return this.queueName;
  }
}
