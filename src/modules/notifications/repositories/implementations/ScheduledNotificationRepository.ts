import { prisma } from "@shared/infra/database/prisma";

import {
  ICreateScheduledNotificationDTO,
  IScheduledNotificationProps,
  IUpdateScheduledNotificationDTO,
  RecurrencePattern,
} from "../../types/scheduledNotification";
import { IScheduledNotificationRepository } from "../IScheduledNotificationRepository";

export class ScheduledNotificationRepository
  implements IScheduledNotificationRepository
{
  async create(
    data: ICreateScheduledNotificationDTO
  ): Promise<IScheduledNotificationProps> {
    const scheduled = await prisma.scheduledNotification.create({
      data: {
        title: data.title,
        body: data.body,
        target_users: data.target_users
          ? JSON.stringify(data.target_users)
          : null,
        target_roles: data.target_roles
          ? JSON.stringify(data.target_roles)
          : null,
        scheduled_for: data.scheduled_for,
        recurrence_pattern: data.recurrence_pattern,
        timezone: data.timezone,
        created_by: data.created_by,
        next_run_at: data.scheduled_for,
        data: data.data ? JSON.stringify(data.data) : null,
      },
    });

    return this.mapToProps(scheduled);
  }

  async findById(id: number): Promise<IScheduledNotificationProps | null> {
    const scheduled = await prisma.scheduledNotification.findUnique({
      where: { id },
    });

    return scheduled ? this.mapToProps(scheduled) : null;
  }

  async findAll(filters?: {
    is_active?: boolean;
    created_by?: number;
  }): Promise<IScheduledNotificationProps[]> {
    const scheduled = await prisma.scheduledNotification.findMany({
      where: {
        is_active: filters?.is_active,
        created_by: filters?.created_by,
      },
      orderBy: {
        scheduled_for: "asc",
      },
    });

    return scheduled.map((s) => this.mapToProps(s));
  }

  async findDue(now: Date): Promise<IScheduledNotificationProps[]> {
    const scheduled = await prisma.scheduledNotification.findMany({
      where: {
        is_active: true,
        next_run_at: {
          lte: now,
        },
      },
    });

    return scheduled.map((s) => this.mapToProps(s));
  }

  async update(
    data: IUpdateScheduledNotificationDTO
  ): Promise<IScheduledNotificationProps> {
    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.body !== undefined) updateData.body = data.body;
    if (data.target_users !== undefined)
      updateData.target_users = JSON.stringify(data.target_users);
    if (data.target_roles !== undefined)
      updateData.target_roles = JSON.stringify(data.target_roles);
    if (data.scheduled_for !== undefined)
      updateData.scheduled_for = data.scheduled_for;
    if (data.recurrence_pattern !== undefined)
      updateData.recurrence_pattern = data.recurrence_pattern;
    if (data.timezone !== undefined) updateData.timezone = data.timezone;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;
    if (data.data !== undefined) updateData.data = JSON.stringify(data.data);

    const scheduled = await prisma.scheduledNotification.update({
      where: { id: data.id },
      data: updateData,
    });

    return this.mapToProps(scheduled);
  }

  async delete(id: number): Promise<void> {
    await prisma.scheduledNotification.delete({
      where: { id },
    });
  }

  async updateLastSentAt(id: number, sentAt: Date): Promise<void> {
    await prisma.scheduledNotification.update({
      where: { id },
      data: { last_sent_at: sentAt },
    });
  }

  async updateNextRunAt(id: number, nextRunAt: Date): Promise<void> {
    await prisma.scheduledNotification.update({
      where: { id },
      data: { next_run_at: nextRunAt },
    });
  }

  private mapToProps(
    scheduled: Record<string, unknown>
  ): IScheduledNotificationProps {
    return {
      id: scheduled.id as number,
      title: scheduled.title as string,
      body: scheduled.body as string,
      target_users: scheduled.target_users as string | undefined,
      target_roles: scheduled.target_roles as string | undefined,
      scheduled_for: scheduled.scheduled_for as Date,
      recurrence_pattern: scheduled.recurrence_pattern as
        | RecurrencePattern
        | undefined,
      timezone: scheduled.timezone as string | undefined,
      is_active: scheduled.is_active as boolean,
      last_sent_at: scheduled.last_sent_at as Date | undefined,
      next_run_at: scheduled.next_run_at as Date | undefined,
      created_by: scheduled.created_by as number,
      created_at: scheduled.created_at as Date,
      updated_at: scheduled.updated_at as Date,
      data: scheduled.data as string | undefined,
    };
  }
}
