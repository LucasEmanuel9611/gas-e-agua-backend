import request from "supertest";

import { app } from "@shared/infra/http/app";

import { mockGetAdminHomeDashboardUseCase } from "../../../../../jest/mocks/useCaseMocks";

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

describe("GetAdminHomeDashboardController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return dashboard data with status 200", async () => {
    const dashboardData = {
      totalOrdersToday: 10,
      waterOrdersToday: 6,
      gasOrdersToday: 4,
      waterStockQuantity: 50,
      gasStockQuantity: 30,
      totalRevenueToday: 10000,
    };

    mockGetAdminHomeDashboardUseCase.execute.mockResolvedValue(dashboardData);

    const response = await request(app)
      .get("/orders/dashboard")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(dashboardData);
  });
});
