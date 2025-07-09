import dayjs from "dayjs";
import request from "supertest";

import { app } from "@shared/infra/http/app";

import {
  mockEditOrderUseCase,
  mockListAdminUseCase as mockListAdminUserUseCase,
  mockSendNotificationUseCase,
} from "../../../../../jest/mocks/useCaseMocks";
import { EditOrderController } from "./EditOrderController";

jest.mock("tsyringe", () => {
  const actual = jest.requireActual("tsyringe");
  return {
    ...actual,
    container: {
      resolve: jest.fn(),
    },
  };
});

describe("EditOrderController", () => {
  beforeAll(() => {
    const controller = new EditOrderController();
    //
    app.put("/orders/:id/edit", controller.handle.bind(controller));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update order date successfully and return 201", async () => {
    const mockOrder = {
      id: 123,
      user_id: 456,
      status: "FINALIZADO",
      payment_state: "PENDENTE",
      gasAmount: 1,
      waterAmount: 2,
      total: 50,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      address: {
        street: "Test Street",
        number: "123",
        reference: "Test Reference",
        local: "Test City",
      },
      user: {
        username: "testUser",
        telephone: "81999999999",
      },
    };

    const mockAdminUser = {
      id: 1,
      notificationTokens: ["token1", "token2"],
    };

    mockEditOrderUseCase.execute.mockResolvedValue(mockOrder);
    mockListAdminUserUseCase.execute.mockResolvedValue(mockAdminUser);
    mockSendNotificationUseCase.execute.mockResolvedValue(undefined);

    const newDate = new Date().toISOString();
    const response = await request(app)
      .put("/orders/123/edit")
      .set("Authorization", "Bearer token")
      .send({ date: newDate });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockOrder);
    expect(mockEditOrderUseCase.execute).toHaveBeenCalledWith({
      order_id: "123",
      date: newDate,
    });
    expect(mockListAdminUserUseCase.execute).toHaveBeenCalled();
    expect(mockSendNotificationUseCase.execute).toHaveBeenCalledWith({
      notificationTokens: mockAdminUser.notificationTokens,
      notificationTitle: "Edição no agendamento",
      notificationBody: "Edição de agendamento solicitada no app",
    });
  });

  it("should return 500 if EditOrderUseCase throws an error", async () => {
    mockEditOrderUseCase.execute.mockRejectedValue(new Error("Database error"));
    mockListAdminUserUseCase.execute.mockResolvedValue({
      notificationTokens: [],
    });
    mockSendNotificationUseCase.execute.mockResolvedValue(undefined);

    const response = await request(app)
      .put("/orders/123/edit")
      .set("Authorization", "Bearer token")
      .send({ date: new Date().toISOString() });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Erro interno do servidor");
  });

  it("should return 500 if ListAdminUserUseCase throws an error", async () => {
    mockEditOrderUseCase.execute.mockResolvedValue({});
    mockListAdminUserUseCase.execute.mockRejectedValue(
      new Error("Admin user error")
    );
    mockSendNotificationUseCase.execute.mockResolvedValue(undefined);

    const response = await request(app)
      .put("/orders/123/edit")
      .set("Authorization", "Bearer token")
      .send({ date: new Date().toISOString() });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Erro interno do servidor");
  });

  it("should handle SendNotificationUseCase error gracefully", async () => {
    const mockOrder = {
      id: 123,
      user_id: 456,
      status: "FINALIZADO",
      payment_state: "PENDENTE",
      gasAmount: 1,
      waterAmount: 2,
      total: 50,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      address: {
        street: "Test Street",
        number: "123",
        reference: "Test Reference",
        local: "Test City",
      },
      user: {
        username: "testUser",
        telephone: "81999999999",
      },
    };

    const mockAdminUser = {
      id: 1,
      notificationTokens: ["token1", "token2"],
    };

    mockEditOrderUseCase.execute.mockResolvedValue(mockOrder);
    mockListAdminUserUseCase.execute.mockResolvedValue(mockAdminUser);
    mockSendNotificationUseCase.execute.mockRejectedValue(
      new Error("Notification error")
    );

    const newDate = new Date().toISOString();
    const response = await request(app)
      .put("/orders/123/edit")
      .set("Authorization", "Bearer token")
      .send({ date: newDate });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Erro interno do servidor");
  });

  it("should return 201 if order is null/undefined", async () => {
    mockEditOrderUseCase.execute.mockResolvedValue(null);
    mockListAdminUserUseCase.execute.mockResolvedValue({
      notificationTokens: [],
    });
    mockSendNotificationUseCase.execute.mockResolvedValue(undefined);

    const response = await request(app)
      .put("/orders/123/edit")
      .set("Authorization", "Bearer token")
      .send({ date: new Date().toISOString() });

    expect(response.status).toBe(201);
    expect(response.body).toBeNull();
  });

  it("should return 400 if date is missing", async () => {
    const response = await request(app)
      .put("/orders/123/edit")
      .set("Authorization", "Bearer token")
      .send({
        data: dayjs().toDate().toISOString(),
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
    expect(response.body.message).toContain("data é obrigatória");
  });

  it("should return 400 if id is missing", async () => {
    const response = await request(app)
      .put("/orders/ /edit")
      .set("Authorization", "Bearer token")
      .send({ date: new Date().toISOString() });

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
    expect(response.body.message).toContain("id do pedido é obrigatório");
  });
});
