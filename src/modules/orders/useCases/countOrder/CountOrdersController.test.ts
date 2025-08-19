import request from "supertest";

import { app } from "@shared/infra/http/app";

import { mockListOrdersUseCase } from "../../../../../jest/mocks/useCaseMocks";

jest.mock(
  "../../../../shared/infra/http/middlewares/ensureAuthenticated",
  () => {
    return {
      ensureAuthenticated: (req: any, res: any, next: any) => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return res.status(401).json({ message: "Token de acesso requerido" });
        }

        req.user = { id: 5 };
        return next();
      },
    };
  }
);

jest.mock("../../../../shared/infra/http/middlewares/ensureAdmin", () => ({
  ensureAdmin: (req: any, res: any, next: any) => next(),
}));

describe("CountOrderController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should count orders, returning 200", async () => {
    const mockOrder = [
      {
        id: 1,
        user_id: 5,
        gasAmount: 2,
        waterAmount: 3,
        total: 50,
      },
    ];
    mockListOrdersUseCase.execute.mockResolvedValue(mockOrder);

    const response = await request(app)
      .get("/orders/count")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ quantity: 1 });
  });
});
