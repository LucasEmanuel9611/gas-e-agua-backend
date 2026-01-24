import { prisma } from "@shared/infra/database/prisma";

import {
  ICreateNotificationHistoryDTO,
  IGetUserNotificationHistoryFilters,
  INotificationHistoryProps,
  IUpdateNotificationHistoryDTO,
  NotificationStatus,
} from "../../types/notificationHistory";
import { INotificationHistoryRepository } from "../INotificationHistoryRepository";

export class NotificationHistoryRepository
  implements INotificationHistoryRepository
{
  async create(
    data: ICreateNotificationHistoryDTO
  ): Promise<INotificationHistoryProps> {
    const history = await prisma.notificationHistory.create({
      data: {
        user_id: data.user_id,
        type: data.type,
        title: data.title,
        body: data.body,
        status: data.status,
        data: data.data ? JSON.stringify(data.data) : undefined,
      },
    });

    return this.mapToProps(history);
  }

  async findById(id: number): Promise<INotificationHistoryProps | null> {
    const history = await prisma.notificationHistory.findUnique({
      where: { id },
    });

    return history ? this.mapToProps(history) : null;
  }

  async findByUserId(
    userId: number,
    filters?: IGetUserNotificationHistoryFilters
  ): Promise<{ history: INotificationHistoryProps[]; total: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      user_id: userId,
    };

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.sent_at = {};
      if (filters.startDate) {
        (where.sent_at as Record<string, unknown>).gte = filters.startDate;
      }
      if (filters.endDate) {
        (where.sent_at as Record<string, unknown>).lte = filters.endDate;
      }
    }

    const [history, total] = await Promise.all([
      prisma.notificationHistory.findMany({
        where,
        orderBy: { sent_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.notificationHistory.count({ where }),
    ]);

    return {
      history: history.map((h) => this.mapToProps(h)),
      total,
    };
  }

  async update(
    data: IUpdateNotificationHistoryDTO
  ): Promise<INotificationHistoryProps> {
    const updateData: Record<string, unknown> = {};

    if (data.status !== undefined) updateData.status = data.status;
    if (data.delivered_at !== undefined)
      updateData.delivered_at = data.delivered_at;
    if (data.error !== undefined) updateData.error = data.error;

    const updated = await prisma.notificationHistory.update({
      where: { id: data.id },
      data: updateData,
    });

    return this.mapToProps(updated);
  }

  private mapToProps(
    history: Record<string, unknown>
  ): INotificationHistoryProps {
    return {
      id: history.id as number,
      user_id: history.user_id as number,
      type: history.type as string,
      title: history.title as string,
      body: history.body as string,
      status: history.status as NotificationStatus,
      sent_at: history.sent_at as Date,
      delivered_at: history.delivered_at as Date | undefined,
      error: history.error as string | undefined,
      data: history.data as string | undefined,
    };
  }
}
