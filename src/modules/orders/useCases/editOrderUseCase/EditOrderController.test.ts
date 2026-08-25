import { INestApplication } from "@nestjs/common";
import request from "supertest";

import { AppError } from "@shared/errors/AppError";

import {
  createOrdersControllerTestingApp,
  OrdersControllerTestMocks,
} from "../orders-controller-test.helpers";

describe("EditOrderController", () => {
  let nestApplication: INestApplication;
  let mocks: OrdersControllerTestMocks;

  beforeAll(async () => {
    const testingApp = await createOrdersControllerTestingApp();
    nestApplication = testingApp.nestApplication;
    mocks = testingApp.mocks;
  });

  afterAll(async () => {
    await nestApplication.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mocks.expoPushService.sendPushToAdmins.mockResolvedValue({
      success: true,
      sent: 1,
      failed: 0,
      total: 1,
      errors: [],
    });
  });

  it("should update order successfully and return 200", async () => {
    const mockOrder = {
      id: 123,
      user_id: 456,
      status: "PENDENTE",
      payment_state: "PENDENTE",
      total: 50,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      interest_allowed: true,
      orderItems: [
        {
          id: 1,
          orderId: 123,
          stockId: 1,
          quantity: 2,
          unitValue: 15,
          totalValue: 30,
          stock: { id: 1, name: "Gás", type: "GAS", value: 15 },
        },
        {
          id: 2,
          orderId: 123,
          stockId: 2,
          quantity: 1,
          unitValue: 20,
          totalValue: 20,
          stock: { id: 2, name: "Água", type: "WATER", value: 20 },
        },
      ],
      orderAddons: [],
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

    mocks.editOrderUseCase.execute.mockResolvedValue(mockOrder);

    const response = await request(nestApplication.getHttpServer())
      .put("/orders/123")
      .set("Authorization", "Bearer token")
      .send({
        items: [
          { id: 1, type: "GAS", quantity: 2 },
          { id: 2, type: "WATER", quantity: 1 },
        ],
        addons: [],
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockOrder);
    expect(mocks.editOrderUseCase.execute).toHaveBeenCalledWith({
      order_id: "123",
      items: [
        { id: 1, type: "GAS", quantity: 2 },
        { id: 2, type: "WATER", quantity: 1 },
      ],
      addons: [],
    });
    expect(mocks.expoPushService.sendPushToAdmins).toHaveBeenCalled();
  });

  it("should edit order with water bottle addon", async () => {
    const mockOrder = {
      id: 123,
      user_id: 456,
      status: "PENDENTE",
      payment_state: "PENDENTE",
      total: 45,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      interest_allowed: true,
      orderItems: [
        {
          id: 1,
          orderId: 123,
          stockId: 1,
          quantity: 1,
          unitValue: 25,
          totalValue: 25,
          stock: { id: 1, name: "Gás", type: "GAS", value: 25 },
        },
      ],
      orderAddons: [
        {
          id: 1,
          orderId: 123,
          addonId: 1,
          quantity: 1,
          unitValue: 20,
          totalValue: 20,
          addon: {
            id: 1,
            name: "Botijão para Água",
            type: "WATER_VESSEL",
            value: 20,
          },
        },
      ],
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

    mocks.editOrderUseCase.execute.mockResolvedValue(mockOrder);

    const response = await request(nestApplication.getHttpServer())
      .put("/orders/123")
      .set("Authorization", "Bearer token")
      .send({
        items: [{ id: 1, type: "GAS", quantity: 1 }],
        addons: [{ id: 1, type: "WATER_VESSEL", quantity: 1 }],
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockOrder);
    expect(mocks.expoPushService.sendPushToAdmins).toHaveBeenCalled();
    expect(mocks.editOrderUseCase.execute).toHaveBeenCalledWith({
      order_id: "123",
      items: [{ id: 1, type: "GAS", quantity: 1 }],
      addons: [{ id: 1, type: "WATER_VESSEL", quantity: 1 }],
    });
  });

  it("should edit order with gas bottle addon", async () => {
    const mockOrder = {
      id: 123,
      user_id: 456,
      status: "PENDENTE",
      payment_state: "PENDENTE",
      total: 45,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      interest_allowed: true,
      orderItems: [
        {
          id: 1,
          orderId: 123,
          stockId: 2,
          quantity: 1,
          unitValue: 25,
          totalValue: 25,
          stock: { id: 2, name: "Água", type: "WATER", value: 25 },
        },
      ],
      orderAddons: [
        {
          id: 1,
          orderId: 123,
          addonId: 2,
          quantity: 1,
          unitValue: 20,
          totalValue: 20,
          addon: {
            id: 2,
            name: "Botijão para Gás",
            type: "GAS_VESSEL",
            value: 20,
          },
        },
      ],
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

    mocks.editOrderUseCase.execute.mockResolvedValue(mockOrder);

    const response = await request(nestApplication.getHttpServer())
      .put("/orders/123")
      .set("Authorization", "Bearer token")
      .send({
        items: [{ id: 2, type: "WATER", quantity: 1 }],
        addons: [{ id: 2, type: "GAS_VESSEL", quantity: 1 }],
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockOrder);
    expect(mocks.editOrderUseCase.execute).toHaveBeenCalledWith({
      order_id: "123",
      items: [{ id: 2, type: "WATER", quantity: 1 }],
      addons: [{ id: 2, type: "GAS_VESSEL", quantity: 1 }],
    });
    expect(mocks.expoPushService.sendPushToAdmins).toHaveBeenCalled();
  });

  it("should edit order with both bottle addons", async () => {
    const mockOrder = {
      id: 123,
      user_id: 456,
      status: "PENDENTE",
      payment_state: "PENDENTE",
      total: 65,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      interest_allowed: true,
      orderItems: [
        {
          id: 1,
          orderId: 123,
          stockId: 1,
          quantity: 1,
          unitValue: 25,
          totalValue: 25,
          stock: { id: 1, name: "Gás", type: "GAS", value: 25 },
        },
      ],
      orderAddons: [
        {
          id: 1,
          orderId: 123,
          addonId: 1,
          quantity: 1,
          unitValue: 20,
          totalValue: 20,
          addon: {
            id: 1,
            name: "Botijão para Água",
            type: "WATER_VESSEL",
            value: 20,
          },
        },
        {
          id: 2,
          orderId: 123,
          addonId: 2,
          quantity: 1,
          unitValue: 20,
          totalValue: 20,
          addon: {
            id: 2,
            name: "Botijão para Gás",
            type: "GAS_VESSEL",
            value: 20,
          },
        },
      ],
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

    mocks.editOrderUseCase.execute.mockResolvedValue(mockOrder);

    const response = await request(nestApplication.getHttpServer())
      .put("/orders/123")
      .set("Authorization", "Bearer token")
      .send({
        items: [{ id: 1, type: "GAS", quantity: 1 }],
        addons: [
          { id: 1, type: "WATER_VESSEL", quantity: 1 },
          { id: 2, type: "GAS_VESSEL", quantity: 1 },
        ],
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockOrder);
    expect(mocks.editOrderUseCase.execute).toHaveBeenCalledWith({
      order_id: "123",
      items: [{ id: 1, type: "GAS", quantity: 1 }],
      addons: [
        { id: 1, type: "WATER_VESSEL", quantity: 1 },
        { id: 2, type: "GAS_VESSEL", quantity: 1 },
      ],
    });
  });

  it("should return 500 if EditOrderUseCase throws an error", async () => {
    mocks.editOrderUseCase.execute.mockRejectedValue(
      new Error("Database error")
    );

    const response = await request(nestApplication.getHttpServer())
      .put("/orders/123")
      .set("Authorization", "Bearer token")
      .send({
        items: [{ id: 1, type: "GAS", quantity: 1 }],
        addons: [],
      });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Erro interno do servidor");
  });

  it("should edit order removing addons", async () => {
    const mockOrder = {
      id: 123,
      user_id: 456,
      status: "PENDENTE",
      payment_state: "PENDENTE",
      total: 25,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      interest_allowed: true,
      orderItems: [
        {
          id: 1,
          orderId: 123,
          stockId: 1,
          quantity: 1,
          unitValue: 25,
          totalValue: 25,
          stock: { id: 1, name: "Gás", type: "GAS", value: 25 },
        },
      ],
      orderAddons: [],
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

    mocks.editOrderUseCase.execute.mockResolvedValue(mockOrder);

    const response = await request(nestApplication.getHttpServer())
      .put("/orders/123")
      .set("Authorization", "Bearer token")
      .send({
        items: [{ id: 1, type: "GAS", quantity: 1 }],
        addons: [],
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockOrder);
    expect(mocks.editOrderUseCase.execute).toHaveBeenCalledWith({
      order_id: "123",
      items: [{ id: 1, type: "GAS", quantity: 1 }],
      addons: [],
    });
  });

  it("should update order date successfully and return 200", async () => {
    const mockOrder = {
      id: 123,
      user_id: 456,
      status: "FINALIZADO",
      payment_state: "PENDENTE",
      total: 50,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      interest_allowed: true,
      orderItems: [],
      orderAddons: [],
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

    mocks.editOrderUseCase.execute.mockResolvedValue(mockOrder);

    const newDate = new Date().toISOString();
    const response = await request(nestApplication.getHttpServer())
      .put("/orders/123")
      .set("Authorization", "Bearer token")
      .send({ date: newDate });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockOrder);
    expect(mocks.editOrderUseCase.execute).toHaveBeenCalledWith({
      order_id: "123",
      items: [],
      addons: [],
    });
  });

  it("should return 200 even if sendPushToAdmins throws an error (notification is non-blocking)", async () => {
    const mockOrder = { id: 123, user_id: 456 };
    mocks.editOrderUseCase.execute.mockResolvedValue(mockOrder);
    mocks.expoPushService.sendPushToAdmins.mockRejectedValueOnce(
      new Error("Admin user error")
    );

    const response = await request(nestApplication.getHttpServer())
      .put("/orders/123")
      .set("Authorization", "Bearer token")
      .send({
        items: [{ id: 1, type: "GAS", quantity: 1 }],
        addons: [],
      });

    expect(response.status).toBe(200);
  });

  it("should handle ExpoPushService error gracefully and still return 200", async () => {
    const mockOrder = {
      id: 123,
      user_id: 456,
      status: "PENDENTE",
      payment_state: "PENDENTE",
      total: 50,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      interest_allowed: true,
      orderItems: [],
      orderAddons: [],
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

    mocks.editOrderUseCase.execute.mockResolvedValue(mockOrder);
    mocks.expoPushService.sendPushToAdmins.mockRejectedValueOnce(
      new Error("Notification error")
    );

    const response = await request(nestApplication.getHttpServer())
      .put("/orders/123")
      .set("Authorization", "Bearer token")
      .send({
        items: [{ id: 1, type: "GAS", quantity: 1 }],
        addons: [],
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockOrder);
  });

  it("should return 400 if order is null/undefined", async () => {
    mocks.editOrderUseCase.execute.mockRejectedValue(
      new AppError({ message: "Pedido não encontrado", statusCode: 400 })
    );

    const response = await request(nestApplication.getHttpServer())
      .put("/orders/12")
      .set("Authorization", "Bearer token")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Pedido não encontrado");
  });

  it("should return 400 if order is not found", async () => {
    mocks.editOrderUseCase.execute.mockRejectedValue(
      new AppError({ message: "Pedido não encontrado", statusCode: 400 })
    );

    const response = await request(nestApplication.getHttpServer())
      .put("/orders/999")
      .set("Authorization", "Bearer token")
      .send({
        items: [{ id: 1, type: "GAS", quantity: 1 }],
        addons: [],
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Pedido não encontrado");
  });

  it("should return 400 if order status is not PENDENTE", async () => {
    mocks.editOrderUseCase.execute.mockRejectedValue(
      new AppError({
        message: "Só é possível editar pedidos com status PENDENTE",
        statusCode: 400,
      })
    );

    const response = await request(nestApplication.getHttpServer())
      .put("/orders/123")
      .set("Authorization", "Bearer token")
      .send({
        items: [{ id: 1, type: "GAS", quantity: 1 }],
        addons: [],
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Só é possível editar pedidos com status PENDENTE"
    );
  });

  it("should return 400 if id is missing", async () => {
    const response = await request(nestApplication.getHttpServer())
      .put("/orders/%20")
      .set("Authorization", "Bearer token")
      .send({
        items: [{ id: 1, type: "GAS", quantity: 1 }],
        addons: [],
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
    expect(response.body.message).toContain("id do pedido");
  });
});
