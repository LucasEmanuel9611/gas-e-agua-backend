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
    mockGetStockUseCase.mockResolvedValue([
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
    mockCreateOrderUseCase.mockResolvedValue(mockOrder);
    mockSendNotificationUseCase.execute.mockResolvedValue(undefined);

    const response = await request(app)
      .post("/orders/")
      .send({ gasAmount: 2, waterAmount: 3 })
      .set("Authorization", "Bearer token");

    expect(mockCreateOrderUseCase).toHaveBeenCalledWith({
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

  it("should return 400 if gas stock is insufficient", async () => {
    mockListAdminUseCase.execute.mockResolvedValue({
      id: 1,
      notificationTokens: [],
    });
    mockCreateOrderUseCase.mockRejectedValue(
      new AppError("Estoque insuficiente de gás")
    );

    const response = await request(app)
      .post("/orders/")
      .send({ gasAmount: 2, waterAmount: 1 })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("gás");
  });

  it("should return 400 if water stock is insufficient", async () => {
    mockListAdminUseCase.execute.mockResolvedValue({
      id: 1,
      notificationTokens: [],
    });
    mockCreateOrderUseCase.mockRejectedValue(
      new AppError("Estoque insuficiente de água")
    );

    const response = await request(app)
      .post("/orders/")
      .send({ gasAmount: 1, waterAmount: 2 })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("água");
  });

  it("should return 400 if both stocks are insufficient", async () => {
    mockListAdminUseCase.execute.mockResolvedValue({
      id: 1,
      notificationTokens: [],
    });
    mockCreateOrderUseCase.mockRejectedValue(
      new AppError("Estoque insuficiente de gás e água")
    );

    const response = await request(app)
      .post("/orders/")
      .send({ gasAmount: 2, waterAmount: 2 })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("gás e água");
  });
});
