import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Response } from "express";

import { CurrentUser } from "@shared/decorators/current-user.decorator";
import { Roles } from "@shared/decorators/roles.decorator";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { RolesGuard } from "@shared/guards/roles.guard";
import { metricsService } from "@shared/services/MetricsService";
import { handleControllerError } from "@shared/utils/controller";

import { notificationQueue } from "./infra/queues/NotificationQueue";
import { NotificationStatus } from "./types/notificationHistory";
import {
  NotificationPriority,
  NotificationType,
} from "./types/NotificationTypes";
import { RecurrencePattern } from "./types/scheduledNotification";
import { CleanInvalidTokensUseCase } from "./useCases/cleanInvalidTokens/cleanInvalidTokensUseCase";
import { GetUserNotificationHistoryUseCase } from "./useCases/getUserNotificationHistory/getUserNotificationHistoryUseCase";
import { ManageScheduledNotificationsUseCase } from "./useCases/manageScheduledNotifications/manageScheduledNotificationsUseCase";
import { SendNotificationUseCase } from "./useCases/sendNotification/sendNotificationUseCase";

@Controller("notifications")
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(
    private readonly sendNotificationUseCase: SendNotificationUseCase,
    private readonly getUserNotificationHistoryUseCase: GetUserNotificationHistoryUseCase,
    private readonly cleanInvalidTokensUseCase: CleanInvalidTokensUseCase,
    private readonly manageScheduledNotificationsUseCase: ManageScheduledNotificationsUseCase
  ) {}

  @Post("send/order")
  @HttpCode(202)
  async sendOrderNotification(
    @Body()
    body: {
      orderId: number;
      userId: number;
      notificationType: NotificationType;
      status?: string;
      customData?: Record<string, unknown>;
    }
  ) {
    const { orderId, userId, notificationType, status, customData } = body;

    const result = await this.sendNotificationUseCase.sendOrderNotification(
      orderId,
      userId,
      notificationType,
      status,
      customData
    );

    const orderNotificationResponse = {
      success: result.success,
      sent: result.sent,
      failed: result.failed,
      total: result.total,
      jobId: result.jobId,
      errors: result.errors,
    };

    return orderNotificationResponse;
  }

  @Get("stats")
  async getNotificationStats(@Res() response: Response) {
    try {
      const stats = await notificationQueue.getJobCounts();
      const isPaused = await notificationQueue.isPaused();
      const healthStatus =
        stats.active > 0 || stats.waiting > 0 ? "processing" : "idle";

      return response.status(200).json({
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
          status: healthStatus,
          hasFailures: stats.failed > 0,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return response.status(500).json({
        error: "Failed to get notification stats",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  @Get("history")
  @HttpCode(200)
  async getMyNotificationHistory(
    @CurrentUser() authenticatedUser: { id: string; role: string },
    @Query()
    query: {
      type?: string;
      status?: NotificationStatus;
      startDate?: string;
      endDate?: string;
      page?: string;
      limit?: string;
    }
  ) {
    const userId = Number(authenticatedUser.id);
    const { type, status, startDate, endDate, page, limit } = query;

    return this.getUserNotificationHistoryUseCase.execute(userId, {
      type: type as string | undefined,
      status: status as NotificationStatus | undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get("history/:userId")
  @Roles("ADMIN")
  @HttpCode(200)
  async getUserNotificationHistory(
    @Param("userId") userId: string,
    @Query()
    query: {
      type?: string;
      status?: NotificationStatus;
      startDate?: string;
      endDate?: string;
      page?: string;
      limit?: string;
    }
  ) {
    const { type, status, startDate, endDate, page, limit } = query;

    return this.getUserNotificationHistoryUseCase.execute(Number(userId), {
      type: type as string | undefined,
      status: status as NotificationStatus | undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Post("tokens/clean")
  @Roles("ADMIN")
  @HttpCode(200)
  async cleanInvalidTokens(@Query("olderThanDays") olderThanDays?: string) {
    const result = await this.cleanInvalidTokensUseCase.execute(
      olderThanDays ? Number(olderThanDays) : undefined
    );

    const cleanTokensResponse = {
      message: "Limpeza de tokens concluída",
      tokensRemoved: result.tokensRemoved,
      usersAffected: result.usersAffected,
      hasErrors: result.errors.length > 0,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    };

    return cleanTokensResponse;
  }

  @Post("scheduled")
  @Roles("ADMIN")
  @HttpCode(201)
  async createScheduledNotification(
    @CurrentUser() authenticatedUser: { id: string; role: string },
    @Body()
    body: {
      title: string;
      body: string;
      target_users?: number[];
      target_roles?: string[];
      scheduled_for: string;
      recurrence_pattern?: RecurrencePattern;
      timezone?: string;
      data?: Record<string, unknown>;
    }
  ) {
    const {
      title,
      body: notificationBody,
      target_users,
      target_roles,
      scheduled_for,
      recurrence_pattern,
      timezone,
      data,
    } = body;

    return this.manageScheduledNotificationsUseCase.create({
      title,
      body: notificationBody,
      target_users,
      target_roles,
      scheduled_for: new Date(scheduled_for),
      recurrence_pattern,
      timezone,
      created_by: Number(authenticatedUser.id),
      data,
    });
  }

  @Get("scheduled")
  @Roles("ADMIN")
  @HttpCode(200)
  async findAllScheduledNotifications(
    @Query("is_active") isActive?: string,
    @Query("created_by") createdBy?: string
  ) {
    return this.manageScheduledNotificationsUseCase.findAll({
      is_active: isActive ? isActive === "true" : undefined,
      created_by: createdBy ? Number(createdBy) : undefined,
    });
  }

  @Get("scheduled/:id")
  @Roles("ADMIN")
  @HttpCode(200)
  async findScheduledNotificationById(@Param("id") id: string) {
    return this.manageScheduledNotificationsUseCase.findById(Number(id));
  }

  @Put("scheduled/:id")
  @Roles("ADMIN")
  @HttpCode(200)
  async updateScheduledNotification(
    @Param("id") id: string,
    @Body()
    body: {
      title?: string;
      body?: string;
      target_users?: number[];
      target_roles?: string[];
      scheduled_for?: string;
      recurrence_pattern?: RecurrencePattern;
      timezone?: string;
      is_active?: boolean;
      data?: Record<string, unknown>;
    }
  ) {
    const {
      title,
      body: notificationBody,
      target_users,
      target_roles,
      scheduled_for,
      recurrence_pattern,
      timezone,
      is_active,
      data,
    } = body;

    return this.manageScheduledNotificationsUseCase.update({
      id: Number(id),
      title,
      body: notificationBody,
      target_users,
      target_roles,
      scheduled_for: scheduled_for ? new Date(scheduled_for) : undefined,
      recurrence_pattern,
      timezone,
      is_active,
      data,
    });
  }

  @Delete("scheduled/:id")
  @Roles("ADMIN")
  @HttpCode(204)
  async deleteScheduledNotification(@Param("id") id: string) {
    await this.manageScheduledNotificationsUseCase.delete(Number(id));
  }

  @Post("scheduled/:id/activate")
  @Roles("ADMIN")
  @HttpCode(200)
  async activateScheduledNotification(@Param("id") id: string) {
    return this.manageScheduledNotificationsUseCase.activate(Number(id));
  }

  @Post("scheduled/:id/deactivate")
  @Roles("ADMIN")
  @HttpCode(200)
  async deactivateScheduledNotification(@Param("id") id: string) {
    return this.manageScheduledNotificationsUseCase.deactivate(Number(id));
  }

  @Post("send/bulk")
  @Roles("ADMIN")
  @HttpCode(202)
  async sendBulkNotification(
    @Body()
    body: {
      templateId: string;
      targetUsers?: number[];
      targetRoles?: string[];
      customData?: Record<string, unknown>;
      priority?: NotificationPriority;
    }
  ) {
    const { templateId, targetUsers, targetRoles, customData, priority } = body;

    const result = await this.sendNotificationUseCase.sendBulkNotification(
      templateId,
      targetUsers,
      targetRoles,
      customData,
      priority
    );

    const bulkNotificationResponse = {
      success: result.success,
      sent: result.sent,
      failed: result.failed,
      total: result.total,
      jobId: result.jobId,
      errors: result.errors,
    };

    return bulkNotificationResponse;
  }

  @Post("send/users")
  @Roles("ADMIN")
  @HttpCode(202)
  async sendBroadcastToUsers(
    @Body()
    body: {
      title: unknown;
      message: unknown;
    }
  ) {
    const { title, message } = body;

    const result = await this.sendNotificationUseCase.sendBroadcastToUsers(
      title,
      message
    );

    const broadcastNotificationResponse = {
      success: result.success,
      sent: result.sent,
      failed: result.failed,
      total: result.total,
      jobId: result.jobId,
      errors: result.errors,
    };

    return broadcastNotificationResponse;
  }

  @Post("send/birthday")
  @Roles("ADMIN")
  @HttpCode(202)
  async sendBirthdayNotification(
    @Body()
    body: {
      userId: number;
      customData?: Record<string, unknown>;
    }
  ) {
    const { userId, customData } = body;

    const result = await this.sendNotificationUseCase.sendBirthdayNotification(
      userId,
      customData
    );

    const birthdayNotificationResponse = {
      success: result.success,
      sent: result.sent,
      failed: result.failed,
      total: result.total,
      jobId: result.jobId,
      errors: result.errors,
    };

    return birthdayNotificationResponse;
  }

  @Get("queue/stats")
  @Roles("ADMIN")
  async getQueueStats(@Res() response: Response): Promise<Response> {
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

  @Get("queue/jobs")
  @Roles("ADMIN")
  async getJobs(
    @Res() response: Response,
    @Query("status") status = "waiting",
    @Query("limit") limit = "50"
  ): Promise<Response> {
    try {
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

  @Get("queue/jobs/:jobId")
  @Roles("ADMIN")
  async getJob(
    @Param("jobId") jobId: string,
    @Res() response: Response
  ): Promise<Response> {
    try {
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

  @Post("queue/pause")
  @Roles("ADMIN")
  async pauseQueue(@Res() response: Response): Promise<Response> {
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

  @Post("queue/resume")
  @Roles("ADMIN")
  async resumeQueue(@Res() response: Response): Promise<Response> {
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

  @Post("queue/clean")
  @Roles("ADMIN")
  async cleanQueue(
    @Res() response: Response,
    @Query("status") status = "completed",
    @Query("grace") grace = "3600000"
  ): Promise<Response> {
    try {
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

  @Post("queue/jobs/:jobId/retry")
  @Roles("ADMIN")
  async retryJob(
    @Param("jobId") jobId: string,
    @Res() response: Response
  ): Promise<Response> {
    try {
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

  @Delete("queue/jobs/:jobId")
  @Roles("ADMIN")
  async removeJob(
    @Param("jobId") jobId: string,
    @Res() response: Response
  ): Promise<Response> {
    try {
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
