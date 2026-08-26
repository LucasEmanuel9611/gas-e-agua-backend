import { INestApplication } from "@nestjs/common";
import request from "supertest";

import {
  createOrdersControllerTestingApp,
  OrdersControllerTestMocks,
} from "../orders-controller-test.helpers";

describe("GetDeliveryDaySummaryController", () => {
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

  it("should return 200 with summary data", async () => {
    const summaryData = {
      totalOrdersToday: 5,
      pendingCount: 2,
      inProgressCount: 1,
      completedCount: 2,
    };

    mocks.getDeliveryDaySummaryUseCase.execute.mockResolvedValue(summaryData);

    const response = await request(nestApplication.getHttpServer())
      .get("/orders/delivery/summary")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(summaryData);
  });

  it("should return 500 on internal error", async () => {
    mocks.getDeliveryDaySummaryUseCase.execute.mockRejectedValue(
      new Error("unexpected")
    );

    const response = await request(nestApplication.getHttpServer())
      .get("/orders/delivery/summary")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(500);
  });
});
