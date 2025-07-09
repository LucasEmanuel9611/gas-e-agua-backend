import request from "supertest";

import { AppError } from "@shared/errors/AppError";
import { app } from "@shared/infra/http/app";

import { mockPaymentUseCase } from "../../../../../jest/mocks/useCaseMocks";
import { PaymentController } from "./PaymentController";

jest.mock("tsyringe", () => {
  const actual = jest.requireActual("tsyringe");
  return {
    ...actual,
    container: {
      resolve: jest.fn(() => mockPaymentUseCase),
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

describe("PaymentController", () => {
  beforeAll(() => {
    const controller = new PaymentController();
    app.post("/test/payment", controller.handle.bind(controller));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 and the updated order on successful payment", async () => {
    const mockOrder = {
      id: 1,
      user_id: 5,
      gasAmount: 1,
      waterAmount: 0,
      total: 0,
      payment_state: "PAGO",
      status: "FINALIZADO",
      address_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      interest_allowed: true,
      address: {},
      user: { username: "testuser", telephone: "81999999999" },
      transactions: [],
    };
    mockPaymentUseCase.mockResolvedValue(mockOrder);

    const response = await request(app)
      .post("/test/payment")
      .send({
        order_id: 1,
        amount_paid: 100,
        payment_method: "DINHEIRO",
      })
      .set("Authorization", "Bearer token");

    expect(mockPaymentUseCase).toHaveBeenCalledWith({
      order_id: 1,
      amount_paid: 100,
      payment_method: "DINHEIRO",
    });
    expect(response.status).toBe(200);
    expect(response.body.order).toEqual(mockOrder);
  });

  it("should return 400 if validation fails", async () => {
    const response = await request(app)
      .post("/test/payment")
      .send({})
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
  });

  it("should return the correct status and message if use case throws AppError", async () => {
    mockPaymentUseCase.mockImplementation(() => {
      throw new AppError("Pagamento não permitido", 403);
    });

    const response = await request(app)
      .post("/test/payment")
      .send({
        order_id: 1,
        amount_paid: 100,
        payment_method: "DINHEIRO",
      })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(403);
    expect(response.body.message).toContain("Pagamento não permitido");
  });

  it("should return 500 if use case throws a generic error", async () => {
    mockPaymentUseCase.mockImplementation(() => {
      throw new Error("Erro inesperado");
    });

    const response = await request(app)
      .post("/test/payment")
      .send({
        order_id: 1,
        amount_paid: 100,
        payment_method: "DINHEIRO",
      })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(500);
    expect(response.body.message).toContain("Erro interno do servidor");
  });
});
