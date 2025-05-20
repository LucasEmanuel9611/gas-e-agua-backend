import { ListAdminUserUseCase } from "@modules/accounts/useCases/listAdminUser/ListAdminUserUseCase";
import { GetStockUseCase } from "@modules/stock/useCases/getStock/GetStockUseCase";
import request from "supertest";
import { container } from "tsyringe";

import { app } from "@shared/infra/http/app";

import { SendNotificationUseCase } from "../sendNewOrderNotificationAdmin/SendNewOrderNotificationAdminUseCase";
import { CreateOrderController } from "./CreateOrderController";
import { CreateOrderUseCase } from "./CreateOrderUseCase";

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
        req.user = { id: 5 }; // ou qualquer id que você queira testar
        next();
      },
    };
  }
);

describe("CreateOrderController", () => {
  const mockCreate = jest.fn();
  const mockListAdmin = jest.fn();
  const mockGetStock = jest.fn();
  const mockSend = jest.fn();

  beforeAll(() => {
    const controller = new CreateOrderController();
    app.post("/orders/", controller.handle.bind(controller));
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (container.resolve as jest.Mock).mockImplementation((token: any) => {
      if (token === CreateOrderUseCase) {
        return { execute: mockCreate };
      }
      if (token === SendNotificationUseCase) {
        return { execute: mockSend };
      }
      if (token === ListAdminUserUseCase) {
        return { execute: mockListAdmin };
      }
      if (token === GetStockUseCase) {
        return { execute: mockGetStock };
      }
      return null;
    });
  });

  it("should create an order and notify admins, returning 201", async () => {
    const adminUser = { id: 1, notificationTokens: ["token1", "token2"] };
    mockListAdmin.mockResolvedValue(adminUser);
    mockGetStock.mockResolvedValue([
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
    mockCreate.mockResolvedValue(mockOrder);
    mockSend.mockResolvedValue(undefined);

    const response = await request(app)
      .post("/orders/")
      .send({ gasAmount: "2", waterAmount: "3" })
      .set("Authorization", "Bearer token");

    // expect(mockListAdmin).toHaveBeenCalled();
    // expect(mockGetStock).toHaveBeenCalled();
    expect(mockCreate).toHaveBeenCalledWith({
      user_id: 5,
      isAdmin: false,
      gasAmount: 2,
      waterAmount: 3,
    });
    expect(mockSend).toHaveBeenCalled();
    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockOrder);
  }, 10000);

  it("should return 400 if gas stock is insufficient", async () => {
    mockListAdmin.mockResolvedValue({ id: 1, notificationTokens: [] });
    mockGetStock.mockResolvedValue([
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
    mockListAdmin.mockResolvedValue({ id: 1, notificationTokens: [] });
    mockGetStock.mockResolvedValue([
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
    mockListAdmin.mockResolvedValue({ id: 1, notificationTokens: [] });
    mockGetStock.mockResolvedValue([
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
