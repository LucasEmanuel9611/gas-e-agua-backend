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
    mockListAdminUseCase.mockResolvedValue(adminUser);
    mockGetStockUseCase.mockResolvedValue([
      { name: "Gás", quantity: 10 },
      { name: "Água", quantity: 20 },
    ]);
    const mockOrder = {
      id: 1,
      user_id: 5,
      gasAmount: "2",
      waterAmount: "3",
      total: 50,
    };
    mockCreateOrderUseCase.mockResolvedValue(mockOrder);
    mockSendNotificationUseCase.mockResolvedValue(undefined);

    const response = await request(app)
      .post("/orders/")
      .send({ gasAmount: "2", waterAmount: "3" })
      .set("Authorization", "Bearer token");

    // expect(mockListAdmin).toHaveBeenCalled();
    // expect(mockGetStock).toHaveBeenCalled();
    expect(mockCreateOrderUseCase).toHaveBeenCalledWith({
      user_id: 5,
      gasAmount: 2,
      waterAmount: 3,
    });
    expect(mockSendNotificationUseCase).toHaveBeenCalled();
    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockOrder);
  }, 10000);

  it("should return 400 if gas stock is insufficient", async () => {
    mockListAdminUseCase.mockResolvedValue({ id: 1, notificationTokens: [] });
    mockGetStockUseCase.mockResolvedValue([
      { name: "Gás", quantity: 1 },
      { name: "Água", quantity: 5 },
    ]);

    const response = await request(app)
      .post("/orders/")
      .send({ gasAmount: "2", waterAmount: "1" })
      .set("Authorization", "Bearer token");

    console.log(JSON.stringify(response.body));

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("gás");
  });

  it("should return 400 if water stock is insufficient", async () => {
    mockListAdminUseCase.mockResolvedValue({ id: 1, notificationTokens: [] });
    mockGetStockUseCase.mockResolvedValue([
      { name: "Gás", quantity: 5 },
      { name: "Água", quantity: 1 },
    ]);

    const response = await request(app)
      .post("/orders/")
      .send({ gasAmount: "1", waterAmount: "2" })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("água");
  });

  it("should return 400 if both stocks are insufficient", async () => {
    mockListAdminUseCase.mockResolvedValue({ id: 1, notificationTokens: [] });
    mockGetStockUseCase.mockResolvedValue([
      { name: "Gás", quantity: 1 },
      { name: "Água", quantity: 1 },
    ]);

    const response = await request(app)
      .post("/orders/")
      .send({ gasAmount: "2", waterAmount: "2" })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("gás e água");
  });
});
