import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { inject, injectable } from "tsyringe";

import { AppError } from "@shared/errors/AppError";
import { LoggerService } from "@shared/services/LoggerService";

import { IScheduledNotificationRepository } from "../../repositories/IScheduledNotificationRepository";
import {
  ICreateScheduledNotificationDTO,
  IScheduledNotificationProps,
  IUpdateScheduledNotificationDTO,
} from "../../types/scheduledNotification";

@injectable()
export class ManageScheduledNotificationsUseCase {
  constructor(
    @inject("ScheduledNotificationRepository")
    private scheduledNotificationRepository: IScheduledNotificationRepository,
    @inject("UsersRepository")
    private usersRepository: IUsersRepository
  ) {}

  async create(
    data: ICreateScheduledNotificationDTO
  ): Promise<IScheduledNotificationProps> {
    if (data.scheduled_for < new Date()) {
      throw new AppError({
        message: "A data de agendamento deve ser no futuro",
        statusCode: 400,
      });
    }

    const creator = await this.usersRepository.findById(data.created_by);
    if (!creator) {
      throw new AppError({
        message: "Usuário criador não encontrado",
        statusCode: 404,
      });
    }

    LoggerService.info(
      `Criando notificação agendada para ${data.scheduled_for}`
    );

    const scheduled = await this.scheduledNotificationRepository.create(data);

    LoggerService.info(`Notificação agendada criada: ID ${scheduled.id}`);

    return scheduled;
  }

  async findById(id: number): Promise<IScheduledNotificationProps> {
    const scheduled = await this.scheduledNotificationRepository.findById(id);

    if (!scheduled) {
      throw new AppError({
        message: "Notificação agendada não encontrada",
        statusCode: 404,
      });
    }

    return scheduled;
  }

  async findAll(filters?: {
    is_active?: boolean;
    created_by?: number;
  }): Promise<IScheduledNotificationProps[]> {
    return this.scheduledNotificationRepository.findAll(filters);
  }

  async update(
    data: IUpdateScheduledNotificationDTO
  ): Promise<IScheduledNotificationProps> {
    const existing = await this.scheduledNotificationRepository.findById(
      data.id
    );

    if (!existing) {
      throw new AppError({
        message: "Notificação agendada não encontrada",
        statusCode: 404,
      });
    }

    if (data.scheduled_for && data.scheduled_for < new Date()) {
      throw new AppError({
        message: "A data de agendamento deve ser no futuro",
        statusCode: 400,
      });
    }

    LoggerService.info(`Atualizando notificação agendada: ID ${data.id}`);

    return this.scheduledNotificationRepository.update(data);
  }

  async delete(id: number): Promise<void> {
    const existing = await this.scheduledNotificationRepository.findById(id);

    if (!existing) {
      throw new AppError({
        message: "Notificação agendada não encontrada",
        statusCode: 404,
      });
    }

    LoggerService.info(`Deletando notificação agendada: ID ${id}`);

    await this.scheduledNotificationRepository.delete(id);
  }

  async activate(id: number): Promise<IScheduledNotificationProps> {
    return this.update({ id, is_active: true });
  }

  async deactivate(id: number): Promise<IScheduledNotificationProps> {
    return this.update({ id, is_active: false });
  }
}
