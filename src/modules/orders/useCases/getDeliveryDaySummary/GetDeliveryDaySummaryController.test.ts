import request from "supertest";

import { app } from "@shared/infra/http/app";

import { mockGetDeliveryDaySummaryUseCase } from "../../../../../jest/mocks/useCaseMocks";

jest.mock(
  "../../../../shared/infra/http/middlewares/ensureAuthenticated",
  () => ({
    ensureAuthenticated: (req: any, _res: any, next: any) => {
      req.user = { id: "1", role: "DELIVERY_MAN" };
      next();
    },
  })
);

jest.mock("../../../../shared/infra/http/middlewares/checkRole", () => ({
  checkRole: () => (_req: any, _res: any, next: any) => next(),
}));

describe("GetDeliveryDaySummaryController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 with summary data", async () => {
    const summaryData = {
      totalOrdersToday: 5,
      pendingCount: 2,
      inProgressCount: 1,
      completedCount: 2,
    };

    mockGetDeliveryDaySummaryUseCase.execute.mockResolvedValue(summaryData);

    const response = await request(app)
      .get("/orders/delivery/summary")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(summaryData);
  });

  it("should return 500 on internal error", async () => {
    mockGetDeliveryDaySummaryUseCase.execute.mockRejectedValue(
      new Error("unexpected")
    );

    const response = await request(app)
      .get("/orders/delivery/summary")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(500);
  });
});
