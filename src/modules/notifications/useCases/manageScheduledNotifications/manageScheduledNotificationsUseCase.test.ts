import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { UserDates } from "@modules/accounts/types";

import { AppError } from "@shared/errors/AppError";

import { IScheduledNotificationRepository } from "../../repositories/IScheduledNotificationRepository";
import {
  IScheduledNotificationProps,
  RecurrencePattern,
} from "../../types/scheduledNotification";
import { ManageScheduledNotificationsUseCase } from "./manageScheduledNotificationsUseCase";

describe(ManageScheduledNotificationsUseCase.name, () => {
  let scheduledNotificationRepository: jest.Mocked<IScheduledNotificationRepository>;
  let usersRepository: jest.Mocked<IUsersRepository>;
  let useCase: ManageScheduledNotificationsUseCase;

  const mockUser: UserDates = {
    id: 1,
    username: "adminUser",
    email: "admin@test.com",
    password: "hashed",
    role: "ADMIN",
    telephone: "81999999999",
    created_at: new Date(),
    addresses: [],
    notificationTokens: [],
  };

  const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const mockScheduledNotification: IScheduledNotificationProps = {
    id: 1,
    title: "Promoção de Natal",
    body: "Aproveite nossos descontos!",
    scheduled_for: futureDate,
    is_active: true,
    created_by: 1,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(() => {
    scheduledNotificationRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IScheduledNotificationRepository>;

    usersRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<IUsersRepository>;

    useCase = new ManageScheduledNotificationsUseCase(
      scheduledNotificationRepository,
      usersRepository
    );
  });

  describe("create", () => {
    it("should create a scheduled notification successfully", async () => {
      usersRepository.findById.mockResolvedValue(mockUser);
      scheduledNotificationRepository.create.mockResolvedValue(
        mockScheduledNotification
      );

      const result = await useCase.create({
        title: "Promoção de Natal",
        body: "Aproveite nossos descontos!",
        scheduled_for: futureDate,
        created_by: 1,
      });

      expect(usersRepository.findById).toHaveBeenCalledWith(1);
      expect(scheduledNotificationRepository.create).toHaveBeenCalled();
      expect(result.id).toBe(1);
    });

    it("should throw error if scheduled_for is in the past", async () => {
      await expect(
        useCase.create({
          title: "Test",
          body: "Test body",
          scheduled_for: pastDate,
          created_by: 1,
        })
      ).rejects.toThrow(AppError);

      await expect(
        useCase.create({
          title: "Test",
          body: "Test body",
          scheduled_for: pastDate,
          created_by: 1,
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "A data de agendamento deve ser no futuro",
      });
    });

    it("should throw error if creator user not found", async () => {
      usersRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.create({
          title: "Test",
          body: "Test body",
          scheduled_for: futureDate,
          created_by: 999,
        })
      ).rejects.toThrow(AppError);

      await expect(
        useCase.create({
          title: "Test",
          body: "Test body",
          scheduled_for: futureDate,
          created_by: 999,
        })
      ).rejects.toMatchObject({
        statusCode: 404,
        message: "Usuário criador não encontrado",
      });
    });

    it("should support recurrence pattern", async () => {
      usersRepository.findById.mockResolvedValue(mockUser);
      scheduledNotificationRepository.create.mockResolvedValue({
        ...mockScheduledNotification,
        recurrence_pattern: RecurrencePattern.WEEKLY,
      });

      const result = await useCase.create({
        title: "Promoção Semanal",
        body: "Toda semana!",
        scheduled_for: futureDate,
        created_by: 1,
        recurrence_pattern: RecurrencePattern.WEEKLY,
      });

      expect(result.recurrence_pattern).toBe(RecurrencePattern.WEEKLY);
    });
  });

  describe("findById", () => {
    it("should return scheduled notification by id", async () => {
      scheduledNotificationRepository.findById.mockResolvedValue(
        mockScheduledNotification
      );

      const result = await useCase.findById(1);

      expect(scheduledNotificationRepository.findById).toHaveBeenCalledWith(1);
      expect(result.id).toBe(1);
    });

    it("should throw error if notification not found", async () => {
      scheduledNotificationRepository.findById.mockResolvedValue(null);

      await expect(useCase.findById(999)).rejects.toThrow(AppError);
      await expect(useCase.findById(999)).rejects.toMatchObject({
        statusCode: 404,
        message: "Notificação agendada não encontrada",
      });
    });
  });

  describe("findAll", () => {
    it("should return all scheduled notifications", async () => {
      scheduledNotificationRepository.findAll.mockResolvedValue([
        mockScheduledNotification,
      ]);

      const result = await useCase.findAll();

      expect(scheduledNotificationRepository.findAll).toHaveBeenCalledWith(
        undefined
      );
      expect(result).toHaveLength(1);
    });

    it("should filter by is_active", async () => {
      scheduledNotificationRepository.findAll.mockResolvedValue([
        mockScheduledNotification,
      ]);

      await useCase.findAll({ is_active: true });

      expect(scheduledNotificationRepository.findAll).toHaveBeenCalledWith({
        is_active: true,
      });
    });

    it("should filter by created_by", async () => {
      scheduledNotificationRepository.findAll.mockResolvedValue([
        mockScheduledNotification,
      ]);

      await useCase.findAll({ created_by: 1 });

      expect(scheduledNotificationRepository.findAll).toHaveBeenCalledWith({
        created_by: 1,
      });
    });
  });

  describe("update", () => {
    it("should update scheduled notification successfully", async () => {
      scheduledNotificationRepository.findById.mockResolvedValue(
        mockScheduledNotification
      );
      scheduledNotificationRepository.update.mockResolvedValue({
        ...mockScheduledNotification,
        title: "Updated Title",
      });

      const result = await useCase.update({ id: 1, title: "Updated Title" });

      expect(scheduledNotificationRepository.update).toHaveBeenCalledWith({
        id: 1,
        title: "Updated Title",
      });
      expect(result.title).toBe("Updated Title");
    });

    it("should throw error if notification not found", async () => {
      scheduledNotificationRepository.findById.mockResolvedValue(null);

      await expect(useCase.update({ id: 999, title: "Test" })).rejects.toThrow(
        AppError
      );
    });

    it("should throw error if new scheduled_for is in the past", async () => {
      scheduledNotificationRepository.findById.mockResolvedValue(
        mockScheduledNotification
      );

      await expect(
        useCase.update({ id: 1, scheduled_for: pastDate })
      ).rejects.toThrow(AppError);

      await expect(
        useCase.update({ id: 1, scheduled_for: pastDate })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "A data de agendamento deve ser no futuro",
      });
    });
  });

  describe("delete", () => {
    it("should delete scheduled notification successfully", async () => {
      scheduledNotificationRepository.findById.mockResolvedValue(
        mockScheduledNotification
      );
      scheduledNotificationRepository.delete.mockResolvedValue(undefined);

      await useCase.delete(1);

      expect(scheduledNotificationRepository.delete).toHaveBeenCalledWith(1);
    });

    it("should throw error if notification not found", async () => {
      scheduledNotificationRepository.findById.mockResolvedValue(null);

      await expect(useCase.delete(999)).rejects.toThrow(AppError);
      await expect(useCase.delete(999)).rejects.toMatchObject({
        statusCode: 404,
        message: "Notificação agendada não encontrada",
      });
    });
  });

  describe("activate/deactivate", () => {
    it("should activate notification", async () => {
      scheduledNotificationRepository.findById.mockResolvedValue({
        ...mockScheduledNotification,
        is_active: false,
      });
      scheduledNotificationRepository.update.mockResolvedValue({
        ...mockScheduledNotification,
        is_active: true,
      });

      const result = await useCase.activate(1);

      expect(scheduledNotificationRepository.update).toHaveBeenCalledWith({
        id: 1,
        is_active: true,
      });
      expect(result.is_active).toBe(true);
    });

    it("should deactivate notification", async () => {
      scheduledNotificationRepository.findById.mockResolvedValue(
        mockScheduledNotification
      );
      scheduledNotificationRepository.update.mockResolvedValue({
        ...mockScheduledNotification,
        is_active: false,
      });

      const result = await useCase.deactivate(1);

      expect(scheduledNotificationRepository.update).toHaveBeenCalledWith({
        id: 1,
        is_active: false,
      });
      expect(result.is_active).toBe(false);
    });
  });
});
