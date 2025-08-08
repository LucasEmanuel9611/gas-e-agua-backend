import request from "supertest";

import { app } from "@shared/infra/http/app";

import { mockPaymentUseCase } from "../../../../../jest/mocks/useCaseMocks";

jest.mock("tsyringe", () => {
  const actual = jest.requireActual("tsyringe");
  return {
    ...actual,
    container: {
      resolve: jest.fn(),
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

jest.mock("../../../../shared/infra/http/middlewares/ensureAdmin", () => {
  return {
    ensureAdmin: (req: any, res: any, next: any) => {
      next();
    },
  };
});

describe("PaymentController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a payment and return 200", async () => {
    const mockOrder = {
      id: 1,
      user_id: 5,
      gasAmount: 2,
      waterAmount: 3,
      total: 50,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      status: "PENDENTE",
      payment_state: "PENDENTE",
      interest_allowed: true,
      address: {
        id: 1,
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

    mockPaymentUseCase.execute.mockResolvedValue(mockOrder);

    const response = await request(app)
      .post("/transactions/payment")
      .send({
        order_id: 1,
        amount_paid: 25,
        payment_method: "DINHEIRO",
      })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Pagamento registrado com sucesso");
    expect(response.body.order).toEqual(mockOrder);
  });

  it("should return 400 for invalid data", async () => {
    const response = await request(app)
      .post("/transactions/payment")
      .send({ amount_paid: -10 })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(400);
  });

  it("should return 500 when PaymentUseCase throws an error", async () => {
    mockPaymentUseCase.execute.mockImplementation(() => {
      throw new Error("Database error");
    });

    const response = await request(app)
      .post("/transactions/payment")
      .send({
        order_id: 1,
        amount_paid: 25,
        payment_method: "DINHEIRO",
      })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Erro interno do servidor");
  });
});
