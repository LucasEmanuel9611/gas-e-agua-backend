import { OrderProps } from "@modules/orders/types";
import request from "supertest";

import { app } from "@shared/infra/http/app";

import { mockListOrdersUseCase } from "../../../../../jest/mocks/useCaseMocks";

jest.mock(
  "../../../../shared/infra/http/middlewares/ensureAuthenticated",
  () => ({
    ensureAuthenticated: (req: any, res: any, next: any) => {
      req.user = { id: "1" };
      next();
    },
  })
);

jest.mock(
  "../../../../shared/infra/http/middlewares/ensureAdminForAllScope",
  () => ({
    ensureAdminForAllScope: (req: any, res: any, next: any) => next(),
  })
);

describe("ListOrdersController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockOrders: OrderProps[] = [
    {
      id: 1,
      user_id: 10,
      status: "INICIADO",
      payment_state: "PAGO",
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      total: 100,
      interest_allowed: true,
      orderItems: [
        {
          id: 1,
          orderId: 1,
          stockId: 1,
          quantity: 1,
          unitValue: 40,
          totalValue: 40,
          stock: { id: 1, name: "Gás", type: "GAS", value: 40 },
        },
        {
          id: 2,
          orderId: 1,
          stockId: 2,
          quantity: 2,
          unitValue: 30,
          totalValue: 60,
          stock: { id: 2, name: "Água", type: "WATER", value: 30 },
        },
      ],
      orderAddons: [],
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
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      total: 90,
      interest_allowed: true,
      orderItems: [
        {
          id: 3,
          orderId: 2,
          stockId: 2,
          quantity: 3,
          unitValue: 30,
          totalValue: 90,
          stock: { id: 2, name: "Água", type: "WATER", value: 30 },
        },
      ],
      orderAddons: [],
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

  it("should return paginated orders (scope=all)", async () => {
    mockListOrdersUseCase.execute.mockResolvedValue({
      items: [mockOrders[0]],
      pagination: {
        page: 1,
        limit: 1,
        total: 2,
        totalPages: 2,
        hasNext: true,
        hasPrev: false,
      },
    });

    const response = await request(app)
      .get("/orders")
      .query({ scope: "all", page: 0, limit: 1 })
      .set("Authorization", `Bearer token`);

    expect(mockListOrdersUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 1,
        userId: undefined,
      })
    );
    expect(response.status).toBe(200);
    expect(response.body.items).toEqual([mockOrders[0]]);
    expect(response.body.pagination.page).toBe(0);
    expect(response.body.pagination.total).toBe(2);
  });

  it("should return second page (scope=all)", async () => {
    mockListOrdersUseCase.execute.mockResolvedValue({
      items: [mockOrders[1]],
      pagination: {
        page: 2,
        limit: 1,
        total: 2,
        totalPages: 2,
        hasNext: false,
        hasPrev: true,
      },
    });

    const response = await request(app)
      .get("/orders")
      .query({ scope: "all", page: 1, limit: 1 })
      .set("Authorization", `Bearer token`);

    expect(response.status).toBe(200);
    expect(response.body.items).toEqual([mockOrders[1]]);
    expect(response.body.pagination.page).toBe(1);
  });

  it("should return empty array for out-of-bounds page (scope=all)", async () => {
    mockListOrdersUseCase.execute.mockResolvedValue({
      items: [],
      pagination: {
        page: 6,
        limit: 1,
        total: 2,
        totalPages: 2,
        hasNext: false,
        hasPrev: true,
      },
    });

    const response = await request(app)
      .get("/orders")
      .query({ scope: "all", page: 5, limit: 1 })
      .set("Authorization", `Bearer token`);

    expect(response.status).toBe(200);
    expect(response.body.items).toEqual([]);
    expect(response.body.pagination.page).toBe(5);
  });

  it("should forward openAccounts=true to the use case", async () => {
    mockListOrdersUseCase.execute.mockResolvedValue({
      items: [],
      pagination: {
        page: 1,
        limit: 100,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    });

    const response = await request(app)
      .get("/orders")
      .query({ scope: "me", page: 0, limit: 100, openAccounts: true })
      .set("Authorization", `Bearer token`);

    expect(response.status).toBe(200);
    expect(mockListOrdersUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        openAccounts: true,
        userId: "1",
      })
    );
  });
});
