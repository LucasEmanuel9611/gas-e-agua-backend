import request from "supertest";

import { AppError } from "@shared/errors/AppError";
import { app } from "@shared/infra/http/app";

import {
  mockCreateOrderUseCase,
  mockGetStockUseCase,
  mockListAdminUseCase,
  mockSendNotificationUseCase,
} from "../../../../../jest/mocks/useCaseMocks";
import { CreateOrderController } from "./CreateOrderController";

let mockUserRole = "USER";

jest.mock("tsyringe", () => {
  const actual = jest.requireActual("tsyringe");
  return {
    ...actual,
    container: {
      resolve: jest.fn(),
      registerSingleton: jest.fn(),
    },
  };
});

jest.mock(
  "../../../../shared/infra/http/middlewares/ensureAuthenticated",
  () => {
    return {
      ensureAuthenticated: (req: any, res: any, next: any) => {
        req.user = { id: 5, role: mockUserRole };
        next();
      },
    };
  }
);

describe("CreateOrderController", () => {
  beforeAll(() => {
    const controller = new CreateOrderController();
    app.post("/orders/", controller.handle.bind(controller));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create an order and notify admins, returning 201", async () => {
    const adminUser = { id: 1, notificationTokens: ["token1", "token2"] };
    mockListAdminUseCase.execute.mockResolvedValue(adminUser);
    mockGetStockUseCase.execute.mockResolvedValue([
      { name: "Gás", quantity: 10 },
      { name: "Água", quantity: 20 },
    ]);
    const mockOrder = {
      id: 1,
      user_id: 5,
      total: 50,
      orderItems: [
        {
          id: 1,
          orderId: 1,
          stockId: 1,
          quantity: 2,
          unitValue: 15,
          totalValue: 30,
          stock: { id: 1, name: "Gás", type: "GAS", value: 15 },
        },
        {
          id: 2,
          orderId: 1,
          stockId: 2,
          quantity: 3,
          unitValue: 6.67,
          totalValue: 20,
          stock: { id: 2, name: "Água", type: "WATER", value: 6.67 },
        },
      ],
      orderAddons: [],
    };
    mockCreateOrderUseCase.execute.mockResolvedValue(mockOrder);
    mockSendNotificationUseCase.execute.mockResolvedValue(undefined);

    const response = await request(app)
      .post("/orders/")
      .send({
        items: [
          { id: 1, type: "GAS", quantity: 2 },
          { id: 2, type: "WATER", quantity: 3 },
        ],
        addons: [],
      })
      .set("Authorization", "Bearer token");

    expect(mockCreateOrderUseCase.execute).toHaveBeenCalledWith({
      user_id: 5,
      items: [
        { id: 1, type: "GAS", quantity: 2 },
        { id: 2, type: "WATER", quantity: 3 },
      ],
      addons: [],
    });
    expect(mockSendNotificationUseCase.execute).toHaveBeenCalled();
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      ...mockOrder,
      message: "Pedido criado com sucesso!",
    });
  }, 10000);

  it("should create an order with water bottle addon", async () => {
    const adminUser = { id: 1, notificationTokens: ["token1"] };
    mockListAdminUseCase.execute.mockResolvedValue(adminUser);
    mockGetStockUseCase.execute.mockResolvedValue([
      { name: "Gás", quantity: 10 },
      { name: "Água", quantity: 20 },
    ]);
    const mockOrder = {
      id: 1,
      user_id: 5,
      total: 35,
      orderItems: [
        {
          id: 1,
          orderId: 1,
          stockId: 1,
          quantity: 1,
          unitValue: 10,
          totalValue: 10,
          stock: { id: 1, name: "Gás", type: "GAS", value: 10 },
        },
        {
          id: 2,
          orderId: 1,
          stockId: 2,
          quantity: 2,
          unitValue: 5,
          totalValue: 10,
          stock: { id: 2, name: "Água", type: "WATER", value: 5 },
        },
      ],
      orderAddons: [
        {
          id: 1,
          orderId: 1,
          addonId: 1,
          quantity: 1,
          unitValue: 15,
          totalValue: 15,
          addon: {
            id: 1,
            name: "Botijão para Água",
            type: "WATER_VESSEL",
            value: 15,
          },
        },
      ],
    };
    mockCreateOrderUseCase.execute.mockResolvedValue(mockOrder);
    mockSendNotificationUseCase.execute.mockResolvedValue(undefined);

    const response = await request(app)
      .post("/orders/")
      .send({
        items: [
          { id: 1, type: "GAS", quantity: 1 },
          { id: 2, type: "WATER", quantity: 2 },
        ],
        addons: [{ id: 1, type: "WATER_VESSEL", quantity: 1 }],
      })
      .set("Authorization", "Bearer token");

    expect(mockCreateOrderUseCase.execute).toHaveBeenCalledWith({
      user_id: 5,
      items: [
        { id: 1, type: "GAS", quantity: 1 },
        { id: 2, type: "WATER", quantity: 2 },
      ],
      addons: [{ id: 1, type: "WATER_VESSEL", quantity: 1 }],
    });
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      ...mockOrder,
      message: "Pedido criado com sucesso!",
    });
  });

  it("should create an order with gas bottle addon", async () => {
    const adminUser = { id: 1, notificationTokens: ["token1"] };
    mockListAdminUseCase.execute.mockResolvedValue(adminUser);
    mockGetStockUseCase.execute.mockResolvedValue([
      { name: "Gás", quantity: 10 },
      { name: "Água", quantity: 20 },
    ]);
    const mockOrder = {
      id: 1,
      user_id: 5,
      total: 45,
      orderItems: [
        {
          id: 1,
          orderId: 1,
          stockId: 1,
          quantity: 2,
          unitValue: 15,
          totalValue: 30,
          stock: { id: 1, name: "Gás", type: "GAS", value: 15 },
        },
        {
          id: 2,
          orderId: 1,
          stockId: 2,
          quantity: 1,
          unitValue: 5,
          totalValue: 5,
          stock: { id: 2, name: "Água", type: "WATER", value: 5 },
        },
      ],
      orderAddons: [
        {
          id: 1,
          orderId: 1,
          addonId: 2,
          quantity: 1,
          unitValue: 10,
          totalValue: 10,
          addon: {
            id: 2,
            name: "Botijão para Gás",
            type: "GAS_VESSEL",
            value: 10,
          },
        },
      ],
    };
    mockCreateOrderUseCase.execute.mockResolvedValue(mockOrder);
    mockSendNotificationUseCase.execute.mockResolvedValue(undefined);

    const response = await request(app)
      .post("/orders/")
      .send({
        items: [
          { id: 1, type: "GAS", quantity: 2 },
          { id: 2, type: "WATER", quantity: 1 },
        ],
        addons: [{ id: 2, type: "GAS_VESSEL", quantity: 1 }],
      })
      .set("Authorization", "Bearer token");

    expect(mockCreateOrderUseCase.execute).toHaveBeenCalledWith({
      user_id: 5,
      items: [
        { id: 1, type: "GAS", quantity: 2 },
        { id: 2, type: "WATER", quantity: 1 },
      ],
      addons: [{ id: 2, type: "GAS_VESSEL", quantity: 1 }],
    });
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      ...mockOrder,
      message: "Pedido criado com sucesso!",
    });
  });

  it("should create an order with both bottle addons", async () => {
    const adminUser = { id: 1, notificationTokens: ["token1"] };
    mockListAdminUseCase.execute.mockResolvedValue(adminUser);
    mockGetStockUseCase.execute.mockResolvedValue([
      { name: "Gás", quantity: 10 },
      { name: "Água", quantity: 20 },
    ]);
    const mockOrder = {
      id: 1,
      user_id: 5,
      total: 50,
      orderItems: [
        {
          id: 1,
          orderId: 1,
          stockId: 1,
          quantity: 1,
          unitValue: 15,
          totalValue: 15,
          stock: { id: 1, name: "Gás", type: "GAS", value: 15 },
        },
        {
          id: 2,
          orderId: 1,
          stockId: 2,
          quantity: 1,
          unitValue: 15,
          totalValue: 15,
          stock: { id: 2, name: "Água", type: "WATER", value: 15 },
        },
      ],
      orderAddons: [
        {
          id: 1,
          orderId: 1,
          addonId: 1,
          quantity: 1,
          unitValue: 10,
          totalValue: 10,
          addon: {
            id: 1,
            name: "Botijão para Água",
            type: "WATER_VESSEL",
            value: 10,
          },
        },
        {
          id: 2,
          orderId: 1,
          addonId: 2,
          quantity: 1,
          unitValue: 10,
          totalValue: 10,
          addon: {
            id: 2,
            name: "Botijão para Gás",
            type: "GAS_VESSEL",
            value: 10,
          },
        },
      ],
    };
    mockCreateOrderUseCase.execute.mockResolvedValue(mockOrder);
    mockSendNotificationUseCase.execute.mockResolvedValue(undefined);

    const response = await request(app)
      .post("/orders/")
      .send({
        items: [
          { id: 1, type: "GAS", quantity: 1 },
          { id: 2, type: "WATER", quantity: 1 },
        ],
        addons: [
          { id: 1, type: "WATER_VESSEL", quantity: 1 },
          { id: 2, type: "GAS_VESSEL", quantity: 1 },
        ],
      })
      .set("Authorization", "Bearer token");

    expect(mockCreateOrderUseCase.execute).toHaveBeenCalledWith({
      user_id: 5,
      items: [
        { id: 1, type: "GAS", quantity: 1 },
        { id: 2, type: "WATER", quantity: 1 },
      ],
      addons: [
        { id: 1, type: "WATER_VESSEL", quantity: 1 },
        { id: 2, type: "GAS_VESSEL", quantity: 1 },
      ],
    });
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      ...mockOrder,
      message: "Pedido criado com sucesso!",
    });
  });

  it("should create an order with only water", async () => {
    const adminUser = { id: 1, notificationTokens: ["token1"] };
    mockListAdminUseCase.execute.mockResolvedValue(adminUser);
    mockGetStockUseCase.execute.mockResolvedValue([
      { name: "Gás", quantity: 10 },
      { name: "Água", quantity: 20 },
    ]);
    const mockOrder = {
      id: 1,
      user_id: 5,
      total: 20,
      orderItems: [
        {
          id: 1,
          orderId: 1,
          stockId: 2,
          quantity: 2,
          unitValue: 10,
          totalValue: 20,
          stock: { id: 2, name: "Água", type: "WATER", value: 10 },
        },
      ],
      orderAddons: [],
    };
    mockCreateOrderUseCase.execute.mockResolvedValue(mockOrder);
    mockSendNotificationUseCase.execute.mockResolvedValue(undefined);

    const response = await request(app)
      .post("/orders/")
      .send({
        items: [{ id: 2, type: "WATER", quantity: 2 }],
        addons: [],
      })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      ...mockOrder,
      message: "Pedido criado com sucesso!",
    });
  });

  it("should create an order with only gas", async () => {
    const adminUser = { id: 1, notificationTokens: ["token1"] };
    mockListAdminUseCase.execute.mockResolvedValue(adminUser);
    mockGetStockUseCase.execute.mockResolvedValue([
      { name: "Gás", quantity: 10 },
      { name: "Água", quantity: 20 },
    ]);
    const mockOrder = {
      id: 1,
      user_id: 5,
      total: 30,
      orderItems: [
        {
          id: 1,
          orderId: 1,
          stockId: 1,
          quantity: 2,
          unitValue: 15,
          totalValue: 30,
          stock: { id: 1, name: "Gás", type: "GAS", value: 15 },
        },
      ],
      orderAddons: [],
    };
    mockCreateOrderUseCase.execute.mockResolvedValue(mockOrder);
    mockSendNotificationUseCase.execute.mockResolvedValue(undefined);

    const response = await request(app)
      .post("/orders/")
      .send({
        items: [{ id: 1, type: "GAS", quantity: 2 }],
        addons: [],
      })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      ...mockOrder,
      message: "Pedido criado com sucesso!",
    });
  });

  it("should return 400 when no items are provided", async () => {
    const response = await request(app)
      .post("/orders/")
      .send({ items: [], addons: [] })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("Pelo menos um item");
  });

  it("should return 400 if gas stock is insufficient", async () => {
    mockListAdminUseCase.execute.mockResolvedValue({
      id: 1,
      notificationTokens: [],
    });
    mockCreateOrderUseCase.execute.mockRejectedValue(
      new AppError("Estoque insuficiente de Gás. Disponível: 1, Solicitado: 2")
    );

    const response = await request(app)
      .post("/orders/")
      .send({
        items: [{ id: 1, type: "GAS", quantity: 2 }],
        addons: [],
      })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("Gás");
  });

  it("should return 400 if water stock is insufficient", async () => {
    mockListAdminUseCase.execute.mockResolvedValue({
      id: 1,
      notificationTokens: [],
    });
    mockCreateOrderUseCase.execute.mockRejectedValue(
      new AppError("Estoque insuficiente de Água. Disponível: 1, Solicitado: 2")
    );

    const response = await request(app)
      .post("/orders/")
      .send({
        items: [{ id: 2, type: "WATER", quantity: 2 }],
        addons: [],
      })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("Água");
  });

  it("should return 400 if both stocks are insufficient", async () => {
    mockListAdminUseCase.execute.mockResolvedValue({
      id: 1,
      notificationTokens: [],
    });
    mockCreateOrderUseCase.execute.mockRejectedValue(
      new AppError("Estoque insuficiente de Gás. Disponível: 1, Solicitado: 2")
    );

    const response = await request(app)
      .post("/orders/")
      .send({
        items: [
          { id: 1, type: "GAS", quantity: 2 },
          { id: 2, type: "WATER", quantity: 2 },
        ],
        addons: [],
      })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("Estoque insuficiente");
  });
});

describe("CreateOrderController - Policy Tests", () => {
  beforeAll(() => {
    const controller = new CreateOrderController();
    app.post("/orders/", controller.handle.bind(controller));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should validate admin fields correctly", async () => {
    mockUserRole = "ADMIN";

    const adminUser = { id: 1, notificationTokens: ["token1"], role: "ADMIN" };
    mockListAdminUseCase.execute.mockResolvedValue(adminUser);
    mockGetStockUseCase.execute.mockResolvedValue([
      { name: "Gás", quantity: 10 },
      { name: "Água", quantity: 20 },
    ]);
    const mockOrder = {
      id: 1,
      user_id: 123,
      status: "FINALIZADO",
      payment_state: "PAGO",
      total: 30,
      orderItems: [
        {
          id: 1,
          orderId: 1,
          stockId: 1,
          quantity: 1,
          unitValue: 15,
          totalValue: 15,
          stock: { id: 1, name: "Gás", type: "GAS", value: 15 },
        },
        {
          id: 2,
          orderId: 1,
          stockId: 2,
          quantity: 1,
          unitValue: 15,
          totalValue: 15,
          stock: { id: 2, name: "Água", type: "WATER", value: 15 },
        },
      ],
      orderAddons: [],
    };
    mockCreateOrderUseCase.execute.mockResolvedValue(mockOrder);

    const response = await request(app)
      .post("/orders/")
      .send({
        items: [
          { id: 1, type: "GAS", quantity: 1 },
          { id: 2, type: "WATER", quantity: 1 },
        ],
        addons: [],
        user_id: 123,
        status: "FINALIZADO",
        payment_state: "PAGO",
      })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(201);
    expect(mockCreateOrderUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 123,
        status: "FINALIZADO",
        payment_state: "PAGO",
        items: [
          { id: 1, type: "GAS", quantity: 1 },
          { id: 2, type: "WATER", quantity: 1 },
        ],
        addons: [],
      })
    );
  });

  it("should reject non-admin user trying to use admin fields", async () => {
    mockUserRole = "USER";

    const response = await request(app)
      .post("/orders/")
      .send({
        items: [
          { id: 1, type: "GAS", quantity: 1 },
          { id: 2, type: "WATER", quantity: 1 },
        ],
        addons: [],
        user_id: 123,
        status: "FINALIZADO",
        total: 100,
      })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(403);
    expect(response.body.message).toContain("not allowed to set fields");
  });

  it("should allow regular user to send only basic fields", async () => {
    mockUserRole = "USER";

    const adminUser = { id: 1, notificationTokens: ["token1"] };
    mockListAdminUseCase.execute.mockResolvedValue(adminUser);
    mockGetStockUseCase.execute.mockResolvedValue([
      { name: "Gás", quantity: 10 },
      { name: "Água", quantity: 20 },
    ]);
    const mockOrder = {
      id: 1,
      user_id: 5,
      total: 30,
      orderItems: [
        {
          id: 1,
          orderId: 1,
          stockId: 1,
          quantity: 1,
          unitValue: 15,
          totalValue: 15,
          stock: { id: 1, name: "Gás", type: "GAS", value: 15 },
        },
        {
          id: 2,
          orderId: 1,
          stockId: 2,
          quantity: 1,
          unitValue: 15,
          totalValue: 15,
          stock: { id: 2, name: "Água", type: "WATER", value: 15 },
        },
      ],
      orderAddons: [],
    };
    mockCreateOrderUseCase.execute.mockResolvedValue(mockOrder);
    mockSendNotificationUseCase.execute.mockResolvedValue(undefined);

    const response = await request(app)
      .post("/orders/")
      .send({
        items: [
          { id: 1, type: "GAS", quantity: 1 },
          { id: 2, type: "WATER", quantity: 1 },
        ],
        addons: [{ id: 1, type: "WATER_VESSEL", quantity: 1 }],
      })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      ...mockOrder,
      message: "Pedido criado com sucesso!",
    });
  });

  it("should return success message when notification succeeds", async () => {
    const adminUser = { id: 1, notificationTokens: ["token1"] };
    mockListAdminUseCase.execute.mockResolvedValue(adminUser);
    mockGetStockUseCase.execute.mockResolvedValue([
      { name: "Gás", quantity: 10 },
      { name: "Água", quantity: 20 },
    ]);
    const mockOrder = {
      id: 1,
      user_id: 5,
      total: 30,
      orderItems: [
        {
          id: 1,
          orderId: 1,
          stockId: 1,
          quantity: 1,
          unitValue: 15,
          totalValue: 15,
          stock: { id: 1, name: "Gás", type: "GAS", value: 15 },
        },
        {
          id: 2,
          orderId: 1,
          stockId: 2,
          quantity: 1,
          unitValue: 15,
          totalValue: 15,
          stock: { id: 2, name: "Água", type: "WATER", value: 15 },
        },
      ],
      orderAddons: [],
    };

    mockCreateOrderUseCase.execute.mockResolvedValue(mockOrder);
    mockSendNotificationUseCase.execute.mockResolvedValue(undefined);

    const response = await request(app)
      .post("/orders/")
      .send({
        items: [
          { id: 1, type: "GAS", quantity: 1 },
          { id: 2, type: "WATER", quantity: 1 },
        ],
        addons: [],
      })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      ...mockOrder,
      message: "Pedido criado com sucesso!",
    });
    expect(response.body).not.toHaveProperty("notificationStatus");
  });

  it("should return failure message when notification fails", async () => {
    const adminUser = { id: 1, notificationTokens: ["token1"] };
    mockListAdminUseCase.execute.mockResolvedValue(adminUser);
    mockGetStockUseCase.execute.mockResolvedValue([
      { name: "Gás", quantity: 10 },
      { name: "Água", quantity: 20 },
    ]);
    const mockOrder = {
      id: 1,
      user_id: 5,
      total: 30,
      orderItems: [
        {
          id: 1,
          orderId: 1,
          stockId: 1,
          quantity: 1,
          unitValue: 15,
          totalValue: 15,
          stock: { id: 1, name: "Gás", type: "GAS", value: 15 },
        },
        {
          id: 2,
          orderId: 1,
          stockId: 2,
          quantity: 1,
          unitValue: 15,
          totalValue: 15,
          stock: { id: 2, name: "Água", type: "WATER", value: 15 },
        },
      ],
      orderAddons: [],
    };
    mockCreateOrderUseCase.execute.mockResolvedValue(mockOrder);
    mockSendNotificationUseCase.execute.mockRejectedValue(
      new Error("Falha na notificação")
    );

    const response = await request(app)
      .post("/orders/")
      .send({
        items: [
          { id: 1, type: "GAS", quantity: 1 },
          { id: 2, type: "WATER", quantity: 1 },
        ],
        addons: [],
      })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      ...mockOrder,
      message: "Pedido criado com sucesso, notificação não enviada",
    });
  });
});
