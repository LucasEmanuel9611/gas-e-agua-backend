import { UsersRepository } from "@modules/accounts/repositories/implementations/UsersRepository";
import { OrdersRepository } from "@modules/orders/repositories/implementations/OrdersRepository";
import dayjs from "dayjs";

import { SendNotificationUseCase } from "../sendNewOrderNotificationAdmin/SendNewOrderNotificationAdminUseCase";
import { SendOrderPaymentNotificationsUseCase } from "./SendOrderPaymentNotificationsUseCase";

let ordersRepository: OrdersRepository;
let usersRepository: UsersRepository;
let sendOrderPaymentNotificationsUseCase: SendOrderPaymentNotificationsUseCase;
let sendNotificationUseCase: SendNotificationUseCase;

describe("Send Order Payment Notifications Use Case", () => {
  beforeEach(async () => {
    ordersRepository = new OrdersRepository();
    usersRepository = new UsersRepository();
    sendNotificationUseCase = new SendNotificationUseCase();

    sendOrderPaymentNotificationsUseCase =
      new SendOrderPaymentNotificationsUseCase(
        ordersRepository,
        sendNotificationUseCase
      );
  });

  it("should send first expiration notification with 'Seu pedido vence Hoje!' for users without overdue orders", async () => {
    const user = await usersRepository.create({
      email: "user@example.com",
      username: "user",
      password: "123456",
      telephone: "81999999999",
      address: {
        id: 1,
        local: "Cidade Teste",
        number: "123",
        reference: "Referência teste",
        street: "Rua A",
      },
    });

    // Mock notification tokens for the user
    const mockNotificationTokens = [
      { id: 1, token: "mock-token-123", user_id: user.id },
    ];
    jest.spyOn(ordersRepository, "findOrdersByDateRange").mockResolvedValue([
      {
        id: 1,
        user_id: user.id,
        status: "FINALIZADO",
        payment_state: "PENDENTE",
        total: 50,
        gasAmount: 1,
        waterAmount: 2,
        created_at: dayjs().subtract(30, "days").toDate(),
        updated_at: new Date(),
        address: user.addresses.find((addr) => addr.isDefault),
        interest_allowed: true,
        user: {
          username: user.username,
          telephone: user.telephone,
          notificationTokens: mockNotificationTokens,
        },
      },
    ] as any);

    jest
      .spyOn(ordersRepository, "findOrdersByPaymentState")
      .mockResolvedValue([]);

    const mockExecute = jest
      .spyOn(sendNotificationUseCase, "execute")
      .mockResolvedValue();

    const result = await sendOrderPaymentNotificationsUseCase.execute();

    expect(mockExecute).toHaveBeenCalledWith({
      notificationTokens: mockNotificationTokens,
      notificationTitle: "⏳Seu pedido vence Hoje!",
      notificationBody:
        "Já se passaram 30 dias sem pagamento. Aproveite e quite agora.",
    });

    expect(result.expirationNotifications).toBe(1);
    expect(result.overdueNotifications).toBe(0);
    expect(result.total).toBe(1);
  });

  it("should send additional expiration notification with 'Outro pedido vence Hoje!' for users with existing overdue orders", async () => {
    const user = await usersRepository.create({
      email: "user2@example.com",
      username: "user2",
      password: "123456",
      telephone: "81999999999",
      address: {
        id: 2,
        local: "Cidade Teste",
        number: "123",
        reference: "Referência teste",
        street: "Rua A",
      },
    });

    const mockNotificationTokens = [
      { id: 2, token: "mock-token-456", user_id: user.id },
    ];

    // Mock orders near expiration
    jest.spyOn(ordersRepository, "findOrdersByDateRange").mockResolvedValue([
      {
        id: 2,
        user_id: user.id,
        status: "FINALIZADO",
        payment_state: "PENDENTE",
        total: 50,
        gasAmount: 1,
        waterAmount: 2,
        created_at: dayjs().subtract(30, "days").toDate(),
        updated_at: new Date(),
        address: user.addresses.find((addr) => addr.isDefault),
        interest_allowed: true,
        user: {
          username: user.username,
          telephone: user.telephone,
          notificationTokens: mockNotificationTokens,
        },
      },
    ] as any);

    // Mock existing overdue orders
    jest.spyOn(ordersRepository, "findOrdersByPaymentState").mockResolvedValue([
      {
        id: 1,
        user_id: user.id,
        status: "FINALIZADO",
        payment_state: "VENCIDO",
        total: 40,
        gasAmount: 1,
        waterAmount: 1,
        created_at: dayjs().subtract(35, "days").toDate(),
        updated_at: new Date(),
        address: user.addresses.find((addr) => addr.isDefault),
        interest_allowed: true,
        user: {
          username: user.username,
          telephone: user.telephone,
          notificationTokens: mockNotificationTokens,
        },
      },
    ] as any);

    const mockExecute = jest
      .spyOn(sendNotificationUseCase, "execute")
      .mockResolvedValue();

    const result = await sendOrderPaymentNotificationsUseCase.execute();

    expect(mockExecute).toHaveBeenCalledWith({
      notificationTokens: mockNotificationTokens,
      notificationTitle: "⏳Outro pedido vence Hoje!",
      notificationBody:
        "Já se passaram 30 dias sem pagamento. Aproveite e quite agora.",
    });

    expect(result.expirationNotifications).toBe(1);
    expect(result.total).toBeGreaterThanOrEqual(1);
  });

  it("should send periodic notifications for single overdue order at 35 days", async () => {
    const user = await usersRepository.create({
      email: "user3@example.com",
      username: "user3",
      password: "123456",
      telephone: "81999999999",
      address: {
        id: 3,
        local: "Cidade Teste",
        number: "123",
        reference: "Referência teste",
        street: "Rua A",
      },
    });

    const mockNotificationTokens = [
      { id: 3, token: "mock-token-789", user_id: user.id },
    ];

    jest.spyOn(ordersRepository, "findOrdersByDateRange").mockResolvedValue([]);

    jest.spyOn(ordersRepository, "findOrdersByPaymentState").mockResolvedValue([
      {
        id: 3,
        user_id: user.id,
        status: "FINALIZADO",
        payment_state: "VENCIDO",
        total: 50,
        gasAmount: 1,
        waterAmount: 2,
        created_at: dayjs().subtract(35, "days").toDate(),
        updated_at: new Date(),
        address: user.addresses.find((addr) => addr.isDefault),
        interest_allowed: true,
        user: {
          username: user.username,
          telephone: user.telephone,
          notificationTokens: mockNotificationTokens,
        },
      },
    ] as any);

    const mockExecute = jest
      .spyOn(sendNotificationUseCase, "execute")
      .mockResolvedValue();

    const result = await sendOrderPaymentNotificationsUseCase.execute();

    expect(mockExecute).toHaveBeenCalledWith({
      notificationTokens: mockNotificationTokens,
      notificationTitle: "Pedido há 35 dias sem pagamento 😕.",
      notificationBody:
        "Já se passaram 35 dias desde a compra sem pagamento. Aproveite e quite agora.",
    });

    expect(result.expirationNotifications).toBe(0);
    expect(result.overdueNotifications).toBe(1);
    expect(result.total).toBe(1);
  });

  it("should send periodic notifications for multiple overdue orders", async () => {
    const user = await usersRepository.create({
      email: "user4@example.com",
      username: "user4",
      password: "123456",
      telephone: "81999999999",
      address: {
        id: 4,
        local: "Cidade Teste",
        number: "123",
        reference: "Referência teste",
        street: "Rua A",
      },
    });

    const mockNotificationTokens = [
      { id: 4, token: "mock-token-abc", user_id: user.id },
    ];

    jest.spyOn(ordersRepository, "findOrdersByDateRange").mockResolvedValue([]);

    jest.spyOn(ordersRepository, "findOrdersByPaymentState").mockResolvedValue([
      {
        id: 4,
        user_id: user.id,
        status: "FINALIZADO",
        payment_state: "VENCIDO",
        total: 50,
        gasAmount: 1,
        waterAmount: 2,
        created_at: dayjs().subtract(40, "days").toDate(),
        updated_at: new Date(),
        address: user.addresses.find((addr) => addr.isDefault),
        interest_allowed: true,
        user: {
          username: user.username,
          telephone: user.telephone,
          notificationTokens: mockNotificationTokens,
        },
      },
      {
        id: 5,
        user_id: user.id,
        status: "FINALIZADO",
        payment_state: "VENCIDO",
        total: 30,
        gasAmount: 0,
        waterAmount: 1,
        created_at: dayjs().subtract(37, "days").toDate(),
        updated_at: new Date(),
        address: user.addresses.find((addr) => addr.isDefault),
        interest_allowed: true,
        user: {
          username: user.username,
          telephone: user.telephone,
          notificationTokens: mockNotificationTokens,
        },
      },
    ] as any);

    const mockExecute = jest
      .spyOn(sendNotificationUseCase, "execute")
      .mockResolvedValue();

    const result = await sendOrderPaymentNotificationsUseCase.execute();

    expect(mockExecute).toHaveBeenCalledWith({
      notificationTokens: mockNotificationTokens,
      notificationTitle:
        "Você tem um ou mais pedidos há 40 dias sem pagamento 😕.",
      notificationBody:
        "Já se passaram 40 dias desde a compra sem pagamento. Aproveite e quite agora.",
    });

    expect(result.expirationNotifications).toBe(0);
    expect(result.overdueNotifications).toBe(1);
    expect(result.total).toBe(1);
  });

  it("should not send notifications for orders without notification tokens", async () => {
    const user = await usersRepository.create({
      email: "user5@example.com",
      username: "user5",
      password: "123456",
      telephone: "81999999999",
      address: {
        id: 5,
        local: "Cidade Teste",
        number: "123",
        reference: "Referência teste",
        street: "Rua A",
      },
    });

    jest.spyOn(ordersRepository, "findOrdersByDateRange").mockResolvedValue([
      {
        id: 6,
        user_id: user.id,
        status: "FINALIZADO",
        payment_state: "PENDENTE",
        total: 50,
        gasAmount: 1,
        waterAmount: 2,
        created_at: dayjs().subtract(30, "days").toDate(),
        updated_at: new Date(),
        address: user.addresses.find((addr) => addr.isDefault),
        interest_allowed: true,
        user: {
          username: user.username,
          telephone: user.telephone,
          notificationTokens: [], // Empty tokens
        },
      },
    ] as any);

    jest
      .spyOn(ordersRepository, "findOrdersByPaymentState")
      .mockResolvedValue([]);

    const mockExecute = jest.spyOn(sendNotificationUseCase, "execute");

    const result = await sendOrderPaymentNotificationsUseCase.execute();

    expect(mockExecute).not.toHaveBeenCalled();
    expect(result.expirationNotifications).toBe(0);
    expect(result.overdueNotifications).toBe(0);
    expect(result.total).toBe(0);
  });

  it("should not send overdue notifications for orders not at 5-day intervals", async () => {
    const user = await usersRepository.create({
      email: "user6@example.com",
      username: "user6",
      password: "123456",
      telephone: "81999999999",
      address: {
        id: 6,
        local: "Cidade Teste",
        number: "123",
        reference: "Referência teste",
        street: "Rua A",
      },
    });

    const mockNotificationTokens = [
      { id: 6, token: "mock-token-def", user_id: user.id },
    ];

    jest.spyOn(ordersRepository, "findOrdersByDateRange").mockResolvedValue([]);

    jest.spyOn(ordersRepository, "findOrdersByPaymentState").mockResolvedValue([
      {
        id: 7,
        user_id: user.id,
        status: "FINALIZADO",
        payment_state: "VENCIDO",
        total: 50,
        gasAmount: 1,
        waterAmount: 2,
        created_at: dayjs().subtract(33, "days").toDate(), // 33 days = not multiple of 5 after 30
        updated_at: new Date(),
        address: user.addresses.find((addr) => addr.isDefault),
        interest_allowed: true,
        user: {
          username: user.username,
          telephone: user.telephone,
          notificationTokens: mockNotificationTokens,
        },
      },
    ] as any);

    const mockExecute = jest.spyOn(sendNotificationUseCase, "execute");

    const result = await sendOrderPaymentNotificationsUseCase.execute();

    expect(mockExecute).not.toHaveBeenCalled();
    expect(result.expirationNotifications).toBe(0);
    expect(result.overdueNotifications).toBe(0);
    expect(result.total).toBe(0);
  });
});
