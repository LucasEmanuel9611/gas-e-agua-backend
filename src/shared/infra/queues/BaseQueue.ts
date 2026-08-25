import { Job, JobsOptions, Queue, QueueOptions } from "bullmq";

import { LoggerService } from "@shared/services/LoggerService";

import { redisConnection } from "../redis/redisConnection";

export interface IQueueJob<T = unknown> {
  name: string;
  data: T;
  options?: JobsOptions;
}

export class BaseQueue<T = unknown> {
  public queue: Queue;
  private queueName: string;

  constructor(queueName: string, opts?: QueueOptions) {
    this.queueName = queueName;
    this.queue = new Queue(queueName, {
      connection: redisConnection,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      },
      ...opts,
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.queue.on("error", (error) => {
      LoggerService.error(`Queue ${this.queueName} error:`, error);
    });

    this.queue.on("waiting", (job) => {
      LoggerService.info(`Job ${job.id} waiting in queue ${this.queueName}`);
    });

    this.queue.on("progress", (job, progress) => {
      LoggerService.info(
        `Job ${job.id} progress: ${progress}% in queue ${this.queueName}`
      );
    });
  }

  async addJob(jobData: IQueueJob<T>): Promise<Job> {
    const { name, data, options } = jobData;

    const jobOptions: JobsOptions = {
      delay: options?.delay,
      priority: options?.priority,
      attempts: options?.attempts || 3,
      backoff: options?.backoff || {
        type: "exponential",
        delay: 2000,
      },
      ...options,
    };

    const job = await this.queue.add(name, data, jobOptions);

    LoggerService.info(`Job ${job.id} added to queue ${this.queueName}`);
    return job;
  }

  async addBulkJobs(jobs: IQueueJob<T>[]): Promise<Job[]> {
    const bulkJobs = jobs.map((job) => {
      const jobOptions: JobsOptions = {
        delay: job.options?.delay,
        priority: job.options?.priority,
        attempts: job.options?.attempts || 3,
        backoff: job.options?.backoff || {
          type: "exponential",
          delay: 2000,
        },
        ...job.options,
      };

      return {
        name: job.name,
        data: job.data,
        opts: jobOptions,
      };
    });

    const addedJobs = await this.queue.addBulk(bulkJobs);
    LoggerService.info(
      `${addedJobs.length} jobs added to queue ${this.queueName}`
    );
    return addedJobs;
  }

  async getJob(jobId: string): Promise<Job | undefined> {
    return this.queue.getJob(jobId);
  }

  async getJobs(
    status:
      | "waiting"
      | "active"
      | "completed"
      | "failed"
      | "delayed" = "waiting"
  ): Promise<Job[]> {
    return this.queue.getJobs([status], 0, 100);
  }

  async getJobCounts(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const counts = await this.queue.getJobCounts();
    return {
      waiting: counts.waiting || 0,
      active: counts.active || 0,
      completed: counts.completed || 0,
      failed: counts.failed || 0,
      delayed: counts.delayed || 0,
    };
  }

  async getJobStatus(jobId: string): Promise<string | undefined> {
    const job = await this.queue.getJob(jobId);
    if (!job) return undefined;

    const state = await job.getState();
    return state;
  }

  async getAllJobStatuses(): Promise<{
    waiting: string[];
    active: string[];
    completed: string[];
    failed: string[];
    delayed: string[];
  }> {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.queue.getJobs(["waiting"], 0, 100),
      this.queue.getJobs(["active"], 0, 100),
      this.queue.getJobs(["completed"], 0, 100),
      this.queue.getJobs(["failed"], 0, 100),
      this.queue.getJobs(["delayed"], 0, 100),
    ]);

    return {
      waiting: waiting.map((job) => job.id || "unknown"),
      active: active.map((job) => job.id || "unknown"),
      completed: completed.map((job) => job.id || "unknown"),
      failed: failed.map((job) => job.id || "unknown"),
      delayed: delayed.map((job) => job.id || "unknown"),
    };
  }

  async pause(): Promise<void> {
    await this.queue.pause();
    LoggerService.info(`Queue ${this.queueName} paused`);
  }

  async resume(): Promise<void> {
    await this.queue.resume();
    LoggerService.info(`Queue ${this.queueName} resumed`);
  }

  async isPaused(): Promise<boolean> {
    return this.queue.isPaused();
  }

  async clean(
    grace: number,
    status:
      | "completed"
      | "failed"
      | "active"
      | "waiting"
      | "delayed" = "completed"
  ): Promise<void> {
    await this.queue.clean(grace, 100, status);
    LoggerService.info(`Queue ${this.queueName} cleaned (${status})`);
  }

  async close(): Promise<void> {
    await this.queue.close();
    LoggerService.info(`Queue ${this.queueName} closed`);
  }

  get name(): string {
    return this.queueName;
  }
}
