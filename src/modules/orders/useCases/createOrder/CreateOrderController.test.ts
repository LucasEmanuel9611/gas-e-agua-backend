import request from "supertest";

import { app } from "@shared/infra/http/app";

import {
  mockCreateOrderUseCase,
  mockGetStockUseCase,
  mockListAdminUseCase,
  mockSendNotificationUseCase,
} from "../../../../../jest/mocks/useCaseMocks";
import { CreateOrderController } from "./CreateOrderController";

jest.mock("tsyringe", () => {
  const actual = jest.requireActual("tsyringe");
  return {
    ...actual,
    container: {
      resolve: jest.fn((token: string) => {
        if (token === "CreateOrderUseCase") return mockCreateOrderUseCase;
        if (token === "GetStockUseCase") return mockGetStockUseCase;
        if (token === "ListAdminUserUseCase") return mockListAdminUseCase;
        if (token === "SendNotificationUseCase")
          return mockSendNotificationUseCase;
        return {};
      }),
    },
  };
});

jest.mock(
  "../../../../shared/infra/http/middlewares/ensureAuthenticated",
  () => {
    return {
      ensureAuthenticated: (req: any, res: any, next: any) => {
        req.user = { id: 5 };
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
      gasAmount: 2,
      waterAmount: 3,
      total: 50,
    };
    mockCreateOrderUseCase.execute.mockResolvedValue(mockOrder);
    mockSendNotificationUseCase.execute.mockResolvedValue(undefined);

    const response = await request(app)
      .post("/orders/")
      .send({ gasAmount: 2, waterAmount: 3 })
      .set("Authorization", "Bearer token");

    expect(mockCreateOrderUseCase.execute).toHaveBeenCalledWith({
      user_id: 5,
      gasAmount: 2,
      waterAmount: 3,
      gasWithBottle: false,
      waterWithBottle: false,
    });
    expect(mockSendNotificationUseCase.execute).toHaveBeenCalled();
    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockOrder);
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
      gasAmount: 1,
      waterAmount: 2,
      total: 35,
    };
    mockCreateOrderUseCase.execute.mockResolvedValue(mockOrder);
    mockSendNotificationUseCase.execute.mockResolvedValue(undefined);

    const response = await request(app)
      .post("/orders/")
      .send({
        gasAmount: 1,
        waterAmount: 2,
        waterWithBottle: true,
      })
      .set("Authorization", "Bearer token");

    expect(mockCreateOrderUseCase.execute).toHaveBeenCalledWith({
      user_id: 5,
      gasAmount: 1,
      waterAmount: 2,
      gasWithBottle: false,
      waterWithBottle: true,
    });
    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockOrder);
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
      gasAmount: 2,
      waterAmount: 1,
      total: 45,
    };
    mockCreateOrderUseCase.execute.mockResolvedValue(mockOrder);
    mockSendNotificationUseCase.execute.mockResolvedValue(undefined);

    const response = await request(app)
      .post("/orders/")
      .send({
        gasAmount: 2,
        waterAmount: 1,
        gasWithBottle: true,
      })
      .set("Authorization", "Bearer token");

    expect(mockCreateOrderUseCase.execute).toHaveBeenCalledWith({
      user_id: 5,
      gasAmount: 2,
      waterAmount: 1,
      gasWithBottle: true,
      waterWithBottle: false,
    });
    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockOrder);
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
      gasAmount: 1,
      waterAmount: 1,
      total: 50,
    };
    mockCreateOrderUseCase.execute.mockResolvedValue(mockOrder);
    mockSendNotificationUseCase.execute.mockResolvedValue(undefined);

    const response = await request(app)
      .post("/orders/")
      .send({
        gasAmount: 1,
        waterAmount: 1,
        waterWithBottle: true,
        gasWithBottle: true,
      })
      .set("Authorization", "Bearer token");

    expect(mockCreateOrderUseCase.execute).toHaveBeenCalledWith({
      user_id: 5,
      gasAmount: 1,
      waterAmount: 1,
      gasWithBottle: true,
      waterWithBottle: true,
    });
    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockOrder);
  });

  it("should create an order with gasAmount = 0 and waterAmount > 0", async () => {
    const adminUser = { id: 1, notificationTokens: ["token1"] };
    mockListAdminUseCase.execute.mockResolvedValue(adminUser);
    mockGetStockUseCase.execute.mockResolvedValue([
      { name: "Gás", quantity: 10 },
      { name: "Água", quantity: 20 },
    ]);
    const mockOrder = {
      id: 1,
      user_id: 5,
      gasAmount: 0,
      waterAmount: 2,
      total: 20,
    };
    mockCreateOrderUseCase.execute.mockResolvedValue(mockOrder);
    mockSendNotificationUseCase.execute.mockResolvedValue(undefined);

    const response = await request(app)
      .post("/orders/")
      .send({ gasAmount: 0, waterAmount: 2 })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockOrder);
  });

  it("should create an order with gasAmount > 0 and waterAmount = 0", async () => {
    const adminUser = { id: 1, notificationTokens: ["token1"] };
    mockListAdminUseCase.execute.mockResolvedValue(adminUser);
    mockGetStockUseCase.execute.mockResolvedValue([
      { name: "Gás", quantity: 10 },
      { name: "Água", quantity: 20 },
    ]);
    const mockOrder = {
      id: 1,
      user_id: 5,
      gasAmount: 2,
      waterAmount: 0,
      total: 30,
    };
    mockCreateOrderUseCase.execute.mockResolvedValue(mockOrder);
    mockSendNotificationUseCase.execute.mockResolvedValue(undefined);

    const response = await request(app)
      .post("/orders/")
      .send({ gasAmount: 2, waterAmount: 0 })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockOrder);
  });

  it("should return 400 when both gasAmount and waterAmount are 0", async () => {
    const response = await request(app)
      .post("/orders/")
      .send({ gasAmount: 0, waterAmount: 0 })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(400);
    expect(response.body.message).toContain(
      "Pelo menos um dos valores (Gás ou Água) deve ser maior que zero"
    );
  });

  it("should return 400 for invalid data types", async () => {
    const response = await request(app)
      .post("/orders/")
      .send({ gasAmount: "invalid", waterAmount: 2 })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(400);
    expect(response.body.message).toContain(
      "A quantidade Gás deve ser um número"
    );
  });

  it("should return 400 for negative amounts", async () => {
    const response = await request(app)
      .post("/orders/")
      .send({ gasAmount: -1, waterAmount: 2 })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(400);
    expect(response.body.message).toContain(
      "A quantidade Gás deve ser maior ou igual a zero"
    );
  });

  it("should return 500 when CreateOrderUseCase throws an error", async () => {
    mockListAdminUseCase.execute.mockResolvedValue({ notificationTokens: [] });
    mockGetStockUseCase.execute.mockResolvedValue([]);
    mockCreateOrderUseCase.execute.mockRejectedValue(
      new Error("Database error")
    );

    const response = await request(app)
      .post("/orders/")
      .send({ gasAmount: 1, waterAmount: 1 })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Erro interno do servidor");
  });

  it("should handle missing authorization", async () => {
    const response = await request(app)
      .post("/orders/")
      .send({ gasAmount: 1, waterAmount: 1 });

    expect(response.status).toBe(401);
  });

  it("should handle notification service failure gracefully", async () => {
    const adminUser = { id: 1, notificationTokens: ["token1"] };
    mockListAdminUseCase.execute.mockResolvedValue(adminUser);
    mockGetStockUseCase.execute.mockResolvedValue([
      { name: "Gás", quantity: 10 },
      { name: "Água", quantity: 20 },
    ]);
    const mockOrder = {
      id: 1,
      user_id: 5,
      gasAmount: 1,
      waterAmount: 1,
      total: 20,
    };
    mockCreateOrderUseCase.execute.mockResolvedValue(mockOrder);
    mockSendNotificationUseCase.execute.mockRejectedValue(
      new Error("Notification failed")
    );

    const response = await request(app)
      .post("/orders/")
      .send({ gasAmount: 1, waterAmount: 1 })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockOrder);
  });
});
