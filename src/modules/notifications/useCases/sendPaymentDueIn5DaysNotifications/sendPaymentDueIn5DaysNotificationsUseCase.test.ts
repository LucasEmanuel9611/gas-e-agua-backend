import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { OrderProps } from "@modules/orders/types";
import dayjs from "dayjs";

import { NotificationType } from "../../types/NotificationTypes";
import { SendNotificationUseCase } from "../sendNotification/sendNotificationUseCase";
import { SendPaymentDueIn5DaysNotificationsUseCase } from "./sendPaymentDueIn5DaysNotificationsUseCase";

describe(SendPaymentDueIn5DaysNotificationsUseCase.name, () => {
  let ordersRepository: jest.Mocked<IOrdersRepository>;
  let sendNotificationUseCase: jest.Mocked<SendNotificationUseCase>;
  let useCase: SendPaymentDueIn5DaysNotificationsUseCase;

  const mockOrderWithTokens: OrderProps = {
    id: 1,
    user_id: 100,
    status: "PENDENTE",
    payment_state: "PENDENTE",
    total: 50,
    interest_allowed: true,
    created_at: dayjs().subtract(25, "days").toDate(),
    updated_at: new Date(),
    user: {
      username: "testUser",
      telephone: "81999999999",
      notificationTokens: [
        {
          id: 1,
          token: "ExponentPushToken[xxx]",
          is_valid: true,
          created_at: new Date(),
        },
      ],
    },
    address: {
      id: 1,
      street: "Rua Teste",
      number: "123",
      reference: "Perto do mercado",
      local: "Centro",
      user_id: 100,
    },
    orderItems: [],
    orderAddons: [],
    transactions: [],
  };

  const mockOrderWithoutTokens: OrderProps = {
    ...mockOrderWithTokens,
    id: 2,
    user_id: 101,
    user: {
      username: "noTokenUser",
      telephone: "81888888888",
      notificationTokens: [],
    },
  } as OrderProps;

  beforeEach(() => {
    ordersRepository = {
      findOrdersByDateRange: jest.fn(),
    } as unknown as jest.Mocked<IOrdersRepository>;

    sendNotificationUseCase = {
      sendOrderNotification: jest.fn(),
    } as unknown as jest.Mocked<SendNotificationUseCase>;

    useCase = new SendPaymentDueIn5DaysNotificationsUseCase(
      ordersRepository,
      sendNotificationUseCase
    );
  });

  it("should process orders and send notifications to users with valid tokens", async () => {
    ordersRepository.findOrdersByDateRange.mockResolvedValue([
      mockOrderWithTokens,
    ]);
    sendNotificationUseCase.sendOrderNotification.mockResolvedValue({
      success: true,
      sent: 1,
      failed: 0,
      total: 1,
      jobId: "job-123",
    });

    const result = await useCase.execute();

    expect(ordersRepository.findOrdersByDateRange).toHaveBeenCalledWith({
      startDate: expect.any(Date),
      endDate: expect.any(Date),
      paymentState: "PENDENTE",
    });
    expect(sendNotificationUseCase.sendOrderNotification).toHaveBeenCalledWith(
      mockOrderWithTokens.id,
      mockOrderWithTokens.user_id,
      NotificationType.PAYMENT_DUE_SOON,
      undefined,
      { orderId: 1, daysUntilDue: 5, urgency: "medium" }
    );
    expect(result.notificationsSent).toBe(1);
    expect(result.totalProcessed).toBe(1);
    expect(result.errors).toHaveLength(0);
  });

  it("should skip orders without notification tokens", async () => {
    ordersRepository.findOrdersByDateRange.mockResolvedValue([
      mockOrderWithoutTokens,
    ]);

    const result = await useCase.execute();

    expect(
      sendNotificationUseCase.sendOrderNotification
    ).not.toHaveBeenCalled();
    expect(result.notificationsSent).toBe(0);
    expect(result.totalProcessed).toBe(1);
  });

  it("should handle notification failures gracefully", async () => {
    ordersRepository.findOrdersByDateRange.mockResolvedValue([
      mockOrderWithTokens,
    ]);
    sendNotificationUseCase.sendOrderNotification.mockResolvedValue({
      success: false,
      sent: 0,
      failed: 1,
      total: 1,
      errors: ["Token inválido"],
    });

    const result = await useCase.execute();

    expect(result.notificationsSent).toBe(0);
    expect(result.errors).toContain("Token inválido");
  });

  it("should handle repository errors", async () => {
    ordersRepository.findOrdersByDateRange.mockRejectedValue(
      new Error("Database error")
    );

    const result = await useCase.execute();

    expect(result.notificationsSent).toBe(0);
    expect(result.totalProcessed).toBe(0);
    expect(result.errors).toContain("Database error");
  });

  it("should return correct log prefix", () => {
    expect((useCase as any).getLogPrefix()).toBe("📅 PAYMENT_DUE_IN_5_DAYS");
  });

  it("should return correct notification type", () => {
    expect((useCase as any).getNotificationType()).toBe(
      NotificationType.PAYMENT_DUE_SOON
    );
  });

  it("should return correct custom data", () => {
    const customData = (useCase as any).getCustomData(mockOrderWithTokens);

    expect(customData).toEqual({
      orderId: 1,
      daysUntilDue: 5,
      urgency: "medium",
    });
  });
});
