import { Request, Response } from "express";

import { metricsService } from "@shared/services/MetricsService";
import { handleControllerError } from "@shared/utils/controller";

import { notificationQueue } from "../infra/queues/NotificationQueue";

export class QueueController {
  async getQueueStats(request: Request, response: Response): Promise<Response> {
    try {
      const stats = await notificationQueue.getJobCounts();

      metricsService.setNotificationQueueSize("waiting", stats.waiting);
      metricsService.setNotificationQueueSize("active", stats.active);
      metricsService.setNotificationQueueSize("completed", stats.completed);
      metricsService.setNotificationQueueSize("failed", stats.failed);
      metricsService.setNotificationQueueSize("delayed", stats.delayed);

      return response.status(200).json({
        queue: notificationQueue.name,
        stats: {
          waiting: stats.waiting,
          active: stats.active,
          completed: stats.completed,
          failed: stats.failed,
          delayed: stats.delayed,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return handleControllerError(error, response);
    }
  }

  async getJobs(request: Request, response: Response): Promise<Response> {
    try {
      const { status = "waiting" } = request.query;
      const { limit = 50 } = request.query;

      const jobs = await notificationQueue.getJobs(status as any);
      const limitedJobs = jobs.slice(0, Number(limit));

      const jobsData = limitedJobs.map((job) => ({
        id: job.id,
        name: job.name,
        data: job.data,
        progress: job.progress,
        attemptsMade: job.attemptsMade,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
        failedReason: job.failedReason,
        timestamp: job.timestamp,
      }));

      return response.status(200).json({
        queue: notificationQueue.name,
        status,
        jobs: jobsData,
        total: jobs.length,
        returned: jobsData.length,
      });
    } catch (error) {
      return handleControllerError(error, response);
    }
  }

  async getJob(request: Request, response: Response): Promise<Response> {
    try {
      const { jobId } = request.params;

      const job = await notificationQueue.getJob(jobId);

      if (!job) {
        return response.status(404).json({
          message: "Job não encontrado",
        });
      }

      return response.status(200).json({
        id: job.id,
        name: job.name,
        data: job.data,
        progress: job.progress,
        attemptsMade: job.attemptsMade,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
        failedReason: job.failedReason,
        timestamp: job.timestamp,
        returnvalue: job.returnvalue,
      });
    } catch (error) {
      return handleControllerError(error, response);
    }
  }

  async pauseQueue(request: Request, response: Response): Promise<Response> {
    try {
      await notificationQueue.pause();

      return response.status(200).json({
        message: "Fila pausada com sucesso",
        queue: notificationQueue.name,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return handleControllerError(error, response);
    }
  }

  async resumeQueue(request: Request, response: Response): Promise<Response> {
    try {
      await notificationQueue.resume();

      return response.status(200).json({
        message: "Fila retomada com sucesso",
        queue: notificationQueue.name,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return handleControllerError(error, response);
    }
  }

  async cleanQueue(request: Request, response: Response): Promise<Response> {
    try {
      const { status = "completed", grace = 3600000 } = request.query; // 1 hora por padrão

      await notificationQueue.clean(Number(grace), status as any);

      return response.status(200).json({
        message: `Fila limpa com sucesso (${status})`,
        queue: notificationQueue.name,
        grace: Number(grace),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return handleControllerError(error, response);
    }
  }

  async retryJob(request: Request, response: Response): Promise<Response> {
    try {
      const { jobId } = request.params;

      const job = await notificationQueue.getJob(jobId);

      if (!job) {
        return response.status(404).json({
          message: "Job não encontrado",
        });
      }

      await job.retry();

      return response.status(200).json({
        message: "Job adicionado para retry com sucesso",
        jobId: job.id,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return handleControllerError(error, response);
    }
  }

  async removeJob(request: Request, response: Response): Promise<Response> {
    try {
      const { jobId } = request.params;

      const job = await notificationQueue.getJob(jobId);

      if (!job) {
        return response.status(404).json({
          message: "Job não encontrado",
        });
      }

      await job.remove();

      return response.status(200).json({
        message: "Job removido com sucesso",
        jobId: job.id,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return handleControllerError(error, response);
    }
  }
}
