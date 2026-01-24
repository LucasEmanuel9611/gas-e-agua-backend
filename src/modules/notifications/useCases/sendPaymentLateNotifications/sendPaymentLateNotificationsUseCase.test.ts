import { IOrdersRepository } from "@modules/orders/repositories/IOrdersRepository";
import { OrderProps } from "@modules/orders/types";
import dayjs from "dayjs";

import { NotificationType } from "../../types/NotificationTypes";
import { SendNotificationUseCase } from "../sendNotification/sendNotificationUseCase";
import { SendPaymentLateNotificationsUseCase } from "./sendPaymentLateNotificationsUseCase";

describe(SendPaymentLateNotificationsUseCase.name, () => {
  let ordersRepository: jest.Mocked<IOrdersRepository>;
  let sendNotificationUseCase: jest.Mocked<SendNotificationUseCase>;
  let useCase: SendPaymentLateNotificationsUseCase;

  const createMockOrder = (
    id: number,
    userId: number,
    daysAgo: number,
    hasTokens = true
  ): OrderProps => ({
    id,
    user_id: userId,
    status: "PENDENTE",
    payment_state: "VENCIDO",
    total: 50,
    interest_allowed: true,
    created_at: dayjs().subtract(daysAgo, "days").toDate(),
    updated_at: new Date(),
    user: {
      username: `user${userId}`,
      telephone: "81999999999",
      notificationTokens: hasTokens
        ? [
            {
              id: 1,
              token: "ExponentPushToken[xxx]",
              is_valid: true,
              created_at: new Date(),
            },
          ]
        : [],
    },
    address: {
      id: 1,
      street: "Rua Teste",
      number: "123",
      reference: "Perto do mercado",
      local: "Centro",
      user_id: userId,
    },
    orderItems: [],
    orderAddons: [],
    transactions: [],
  });

  beforeEach(() => {
    ordersRepository = {
      findOrdersByPaymentState: jest.fn(),
    } as unknown as jest.Mocked<IOrdersRepository>;

    sendNotificationUseCase = {
      sendOrderNotification: jest.fn(),
    } as unknown as jest.Mocked<SendNotificationUseCase>;

    useCase = new SendPaymentLateNotificationsUseCase(
      ordersRepository,
      sendNotificationUseCase
    );
  });

  it("should send notification for orders 35 days old (5 days overdue)", async () => {
    const order = createMockOrder(1, 100, 35);
    ordersRepository.findOrdersByPaymentState.mockResolvedValue([order]);
    sendNotificationUseCase.sendOrderNotification.mockResolvedValue({
      success: true,
      sent: 1,
      failed: 0,
      total: 1,
      jobId: "job-123",
    });

    const result = await useCase.execute();

    expect(ordersRepository.findOrdersByPaymentState).toHaveBeenCalledWith(
      "VENCIDO"
    );
    expect(sendNotificationUseCase.sendOrderNotification).toHaveBeenCalledWith(
      1,
      100,
      NotificationType.PAYMENT_LATE,
      undefined,
      expect.objectContaining({
        orderId: 1,
        daysOverdue: 5,
        totalOverdueOrders: 1,
        hasMultipleOrders: false,
      })
    );
    expect(result.notificationsSent).toBe(1);
  });

  it("should send notification for orders 40 days old (10 days overdue)", async () => {
    const order = createMockOrder(1, 100, 40);
    ordersRepository.findOrdersByPaymentState.mockResolvedValue([order]);
    sendNotificationUseCase.sendOrderNotification.mockResolvedValue({
      success: true,
      sent: 1,
      failed: 0,
      total: 1,
      jobId: "job-123",
    });

    const result = await useCase.execute();

    expect(sendNotificationUseCase.sendOrderNotification).toHaveBeenCalled();
    expect(result.notificationsSent).toBe(1);
  });

  it("should NOT send notification for orders 32 days old (not 5-day interval)", async () => {
    const order = createMockOrder(1, 100, 32);
    ordersRepository.findOrdersByPaymentState.mockResolvedValue([order]);

    const result = await useCase.execute();

    expect(
      sendNotificationUseCase.sendOrderNotification
    ).not.toHaveBeenCalled();
    expect(result.notificationsSent).toBe(0);
  });

  it("should NOT send notification for orders less than 30 days old", async () => {
    const order = createMockOrder(1, 100, 25);
    ordersRepository.findOrdersByPaymentState.mockResolvedValue([order]);

    const result = await useCase.execute();

    expect(
      sendNotificationUseCase.sendOrderNotification
    ).not.toHaveBeenCalled();
    expect(result.notificationsSent).toBe(0);
  });

  it("should group orders by user and use oldest order", async () => {
    const olderOrder = createMockOrder(1, 100, 40);
    const newerOrder = createMockOrder(2, 100, 35);
    ordersRepository.findOrdersByPaymentState.mockResolvedValue([
      newerOrder,
      olderOrder,
    ]);
    sendNotificationUseCase.sendOrderNotification.mockResolvedValue({
      success: true,
      sent: 1,
      failed: 0,
      total: 1,
      jobId: "job-123",
    });

    const result = await useCase.execute();

    expect(sendNotificationUseCase.sendOrderNotification).toHaveBeenCalledWith(
      1,
      100,
      NotificationType.PAYMENT_LATE,
      undefined,
      expect.objectContaining({
        orderId: 1,
        totalOverdueOrders: 2,
        hasMultipleOrders: true,
      })
    );
    expect(result.notificationsSent).toBe(1);
  });

  it("should skip users without notification tokens", async () => {
    const orderWithoutTokens = createMockOrder(1, 100, 35, false);
    ordersRepository.findOrdersByPaymentState.mockResolvedValue([
      orderWithoutTokens,
    ]);

    const result = await useCase.execute();

    expect(
      sendNotificationUseCase.sendOrderNotification
    ).not.toHaveBeenCalled();
    expect(result.notificationsSent).toBe(0);
  });

  it("should handle notification failures", async () => {
    const order = createMockOrder(1, 100, 35);
    ordersRepository.findOrdersByPaymentState.mockResolvedValue([order]);
    sendNotificationUseCase.sendOrderNotification.mockResolvedValue({
      success: false,
      errors: ["Token expirado"],
      sent: 0,
      failed: 1,
      total: 1,
    });

    const result = await useCase.execute();

    expect(result.notificationsSent).toBe(0);
    expect(result.errors).toContain("Token expirado");
  });

  it("should handle repository errors", async () => {
    ordersRepository.findOrdersByPaymentState.mockRejectedValue(
      new Error("Database error")
    );

    const result = await useCase.execute();

    expect(result.notificationsSent).toBe(0);
    expect(result.totalProcessed).toBe(0);
    expect(result.errors).toContain("Database error");
  });

  it("should handle empty orders list", async () => {
    ordersRepository.findOrdersByPaymentState.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(
      sendNotificationUseCase.sendOrderNotification
    ).not.toHaveBeenCalled();
    expect(result.notificationsSent).toBe(0);
    expect(result.totalProcessed).toBe(0);
  });

  it("should process multiple users independently", async () => {
    const user1Order = createMockOrder(1, 100, 35);
    const user2Order = createMockOrder(2, 200, 40);
    ordersRepository.findOrdersByPaymentState.mockResolvedValue([
      user1Order,
      user2Order,
    ]);
    sendNotificationUseCase.sendOrderNotification.mockResolvedValue({
      success: true,
      sent: 1,
      failed: 0,
      total: 1,
      jobId: "job-123",
    });

    const result = await useCase.execute();

    expect(sendNotificationUseCase.sendOrderNotification).toHaveBeenCalledTimes(
      2
    );
    expect(result.notificationsSent).toBe(2);
    expect(result.totalProcessed).toBe(2);
  });
});
