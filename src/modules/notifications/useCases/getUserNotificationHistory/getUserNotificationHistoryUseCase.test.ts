import { IUsersRepository } from "@modules/accounts/repositories/interfaces/IUserRepository";
import { UserDates } from "@modules/accounts/types";

import { AppError } from "@shared/errors/AppError";

import { INotificationHistoryRepository } from "../../repositories/INotificationHistoryRepository";
import {
  INotificationHistoryProps,
  NotificationStatus,
} from "../../types/notificationHistory";
import { GetUserNotificationHistoryUseCase } from "./getUserNotificationHistoryUseCase";

describe(GetUserNotificationHistoryUseCase.name, () => {
  let notificationHistoryRepository: jest.Mocked<INotificationHistoryRepository>;
  let usersRepository: jest.Mocked<IUsersRepository>;
  let useCase: GetUserNotificationHistoryUseCase;

  const mockUser: UserDates = {
    id: 1,
    username: "testUser",
    email: "test@test.com",
    password: "hashed",
    role: "USER",
    telephone: "81999999999",
    created_at: new Date(),
    addresses: [],
    notificationTokens: [],
  };

  const mockNotificationHistory: INotificationHistoryProps[] = [
    {
      id: 1,
      user_id: 1,
      type: "ORDER_STATUS",
      title: "Pedido atualizado",
      body: "Seu pedido foi aprovado",
      status: NotificationStatus.DELIVERED,
      sent_at: new Date(),
      delivered_at: new Date(),
    },
    {
      id: 2,
      user_id: 1,
      type: "PAYMENT_REMINDER",
      title: "Lembrete de pagamento",
      body: "Seu pagamento vence em 5 dias",
      status: NotificationStatus.SENT,
      sent_at: new Date(),
    },
  ];

  beforeEach(() => {
    notificationHistoryRepository = {
      findByUserId: jest.fn(),
    } as unknown as jest.Mocked<INotificationHistoryRepository>;

    usersRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<IUsersRepository>;

    useCase = new GetUserNotificationHistoryUseCase(
      notificationHistoryRepository,
      usersRepository
    );
  });

  it("should return notification history for a valid user", async () => {
    usersRepository.findById.mockResolvedValue(mockUser);
    notificationHistoryRepository.findByUserId.mockResolvedValue({
      history: mockNotificationHistory,
      total: 2,
    });

    const result = await useCase.execute(1);

    expect(usersRepository.findById).toHaveBeenCalledWith(1);
    expect(notificationHistoryRepository.findByUserId).toHaveBeenCalledWith(
      1,
      undefined
    );
    expect(result.history).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it("should apply filters when provided", async () => {
    usersRepository.findById.mockResolvedValue(mockUser);
    notificationHistoryRepository.findByUserId.mockResolvedValue({
      history: [mockNotificationHistory[0]],
      total: 1,
    });

    const filters = {
      type: "ORDER_STATUS",
      status: NotificationStatus.DELIVERED,
    };

    const result = await useCase.execute(1, filters);

    expect(notificationHistoryRepository.findByUserId).toHaveBeenCalledWith(
      1,
      filters
    );
    expect(result.history).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it("should throw AppError if user not found", async () => {
    usersRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(AppError);
    await expect(useCase.execute(999)).rejects.toMatchObject({
      statusCode: 404,
      message: "Usuário não encontrado",
    });
  });

  it("should return empty history if user has no notifications", async () => {
    usersRepository.findById.mockResolvedValue(mockUser);
    notificationHistoryRepository.findByUserId.mockResolvedValue({
      history: [],
      total: 0,
    });

    const result = await useCase.execute(1);

    expect(result.history).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it("should support pagination filters", async () => {
    usersRepository.findById.mockResolvedValue(mockUser);
    notificationHistoryRepository.findByUserId.mockResolvedValue({
      history: [mockNotificationHistory[0]],
      total: 10,
    });

    const filters = { page: 1, limit: 1 };
    const result = await useCase.execute(1, filters);

    expect(notificationHistoryRepository.findByUserId).toHaveBeenCalledWith(
      1,
      filters
    );
    expect(result.history).toHaveLength(1);
    expect(result.total).toBe(10);
  });

  it("should support date range filters", async () => {
    usersRepository.findById.mockResolvedValue(mockUser);
    notificationHistoryRepository.findByUserId.mockResolvedValue({
      history: mockNotificationHistory,
      total: 2,
    });

    const startDate = new Date("2024-01-01");
    const endDate = new Date("2024-12-31");
    const filters = { startDate, endDate };

    await useCase.execute(1, filters);

    expect(notificationHistoryRepository.findByUserId).toHaveBeenCalledWith(
      1,
      filters
    );
  });
});
