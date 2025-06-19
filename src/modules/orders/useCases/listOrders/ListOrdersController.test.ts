import { Order } from "@modules/orders/types";
import request from "supertest";
import { container } from "tsyringe";

import { app } from "@shared/infra/http/app";

import { ListOrdersController } from "./listOrdersController";

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
  () => ({
    ensureAuthenticated: (req: any, res: any, next: any) => next(),
  })
);

jest.mock("../../../../shared/infra/http/middlewares/ensureAdmin", () => ({
  ensureAdmin: (req: any, res: any, next: any) => next(),
}));

describe("ListOrdersController", () => {
  const mockExecute = jest.fn();
  const mockListOrdersUseCase = { execute: mockExecute };

  beforeAll(() => {
    const controller = new ListOrdersController();
    app.get("/list/all/:pageNumber/:pageSize", (req, res) =>
      controller.handle(req, res)
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (container.resolve as jest.Mock).mockReturnValue(mockListOrdersUseCase);
  });

  const mockOrders: Order[] = [
    {
      id: 1,
      user_id: 10,
      status: "INICIADO",
      payment_state: "PAGO",
      gasAmount: 1,
      waterAmount: 2,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      total: 100,
      interest_allowed: true,
      total_with_interest: 100,
      address: {
        id: 1,
        street: "Rua A",
        number: "100",
        reference: "Próximo ao mercado",
        local: "Centro",
        user_id: 10,
      },
      user: {
        username: "cliente1",
        telephone: "999999999",
      },
    },
    {
      id: 2,
      user_id: 11,
      status: "FINALIZADO",
      payment_state: "PAGO",
      gasAmount: 0,
      waterAmount: 3,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      total: 90,
      interest_allowed: true,
      total_with_interest: 90,
      address: {
        id: 2,
        street: "Rua B",
        number: "200",
        reference: "Ao lado da padaria",
        local: "Bairro Novo",
        user_id: 11,
      },
      user: {
        username: "cliente2",
        telephone: "988888888",
      },
    },
  ];

  it("should return paginated orders", async () => {
    mockExecute.mockResolvedValue(mockOrders);

    const response = await request(app)
      .get("/list/all/0/1")
      .set("Authorization", `Bearer token`);

    expect(mockExecute).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      page_number: 0,
      total_items_count: 2,
      items: [mockOrders[0]],
    });
  });

  it("should return second page", async () => {
    mockExecute.mockResolvedValue(mockOrders);

    const response = await request(app)
      .get("/list/all/1/1")
      .set("Authorization", `Bearer token`);

    expect(response.status).toBe(200);
    expect(response.body.items).toEqual([mockOrders[1]]);
  });

  it("should return empty array for out-of-bounds page", async () => {
    mockExecute.mockResolvedValue(mockOrders);

    const response = await request(app)
      .get("/list/all/5/1")
      .set("Authorization", `Bearer token`);

    expect(response.status).toBe(200);
    expect(response.body.items).toEqual([]);
  });
});
