import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { OrderProps } from "@modules/orders/types";
import dayjs from "dayjs";

import { NotificationType } from "../../types/NotificationTypes";
import { SendNotificationUseCase } from "../sendNotification/sendNotificationUseCase";
import { SendPaymentDueTomorrowNotificationsUseCase } from "./sendPaymentDueTomorrowNotificationsUseCase";

describe(SendPaymentDueTomorrowNotificationsUseCase.name, () => {
  let ordersRepository: jest.Mocked<IOrdersRepository>;
  let sendNotificationUseCase: jest.Mocked<SendNotificationUseCase>;
  let useCase: SendPaymentDueTomorrowNotificationsUseCase;

  const mockOrderWithTokens: OrderProps = {
    id: 1,
    user_id: 100,
    status: "PENDENTE",
    payment_state: "PENDENTE",
    total: 50,
    interest_allowed: true,
    created_at: dayjs().subtract(29, "days").toDate(),
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

  beforeEach(() => {
    ordersRepository = {
      findOrdersByDateRange: jest.fn(),
    } as unknown as jest.Mocked<IOrdersRepository>;

    sendNotificationUseCase = {
      sendOrderNotification: jest.fn(),
    } as unknown as jest.Mocked<SendNotificationUseCase>;

    useCase = new SendPaymentDueTomorrowNotificationsUseCase(
      ordersRepository,
      sendNotificationUseCase
    );
  });

  it("should process orders due tomorrow and send notifications", async () => {
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
      NotificationType.PAYMENT_DUE_TOMORROW,
      undefined,
      { orderId: 1, daysUntilDue: 1, urgency: "high", isLastChance: true }
    );
    expect(result.notificationsSent).toBe(1);
    expect(result.totalProcessed).toBe(1);
  });

  it("should return correct log prefix", () => {
    expect((useCase as any).getLogPrefix()).toBe("⚠️ PAYMENT_DUE_TOMORROW");
  });

  it("should return correct notification type", () => {
    expect((useCase as any).getNotificationType()).toBe(
      NotificationType.PAYMENT_DUE_TOMORROW
    );
  });

  it("should return correct custom data with high urgency", () => {
    const customData = (useCase as any).getCustomData(mockOrderWithTokens);

    expect(customData).toEqual({
      orderId: 1,
      daysUntilDue: 1,
      urgency: "high",
      isLastChance: true,
    });
  });

  it("should handle empty orders list", async () => {
    ordersRepository.findOrdersByDateRange.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(
      sendNotificationUseCase.sendOrderNotification
    ).not.toHaveBeenCalled();
    expect(result.notificationsSent).toBe(0);
    expect(result.totalProcessed).toBe(0);
  });
});
