import { INestApplication } from "@nestjs/common";
import request from "supertest";

import {
  createOrdersControllerTestingApp,
  OrdersControllerTestMocks,
} from "../orders-controller-test.helpers";

describe("GetAdminHomeDashboardController", () => {
  let nestApplication: INestApplication;
  let mocks: OrdersControllerTestMocks;

  beforeAll(async () => {
    const testingApp = await createOrdersControllerTestingApp();
    nestApplication = testingApp.nestApplication;
    mocks = testingApp.mocks;
  });

  afterAll(async () => {
    await nestApplication.close();
  });

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

    mocks.getAdminHomeDashboardUseCase.execute.mockResolvedValue(dashboardData);

    const response = await request(nestApplication.getHttpServer())
      .get("/orders/dashboard")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(dashboardData);
  });
});
