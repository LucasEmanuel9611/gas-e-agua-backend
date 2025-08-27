import request from "supertest";
import { container } from "tsyringe";

import { app } from "@shared/infra/http/app";

import { ConcludeOrderController } from "./ConcludeOrderController";

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
        req.user = { id: "123", role: "ADMIN" };
        next();
      },
    };
  }
);

describe("ConcludeOrderController", () => {
  beforeAll(() => {
    const controller = new ConcludeOrderController();
    app.put("/orders/:id/conclude", controller.handle.bind(controller));
  });

  it("should update order status successfully", async () => {
    const mockOrder = {
      id: 123,
      user_id: 456,
      status: "FINALIZADO",
      payment_state: "PAGO",
      gasAmount: 1,
      waterAmount: 1,
      updated_at: new Date().toISOString(),
      total: 100,
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

    jest.spyOn(container, "resolve").mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue(mockOrder),
    }));

    const response = await request(app)
      .put("/orders/123/conclude")
      .set("Authorization", "Bearer token")
      .send({
        status: "FINALIZADO",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockOrder);
  });

  it("should return 400 if status is invalid", async () => {
    const response = await request(app)
      .put("/orders/123/conclude")
      .set("Authorization", "Bearer token")
      .send({
        order_id: "123",
        status: "INVALID_STATUS",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Status inválido.");
  });

  it("should return 500 if useCase throws an error", async () => {
    jest.spyOn(container, "resolve").mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(new Error("Erro interno do servidor")),
    }));

    const response = await request(app)
      .put("/orders/123/conclude")
      .set("Authorization", "Bearer token")
      .send({
        status: "FINALIZADO",
      });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Erro interno do servidor");
  });
});
