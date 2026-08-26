import { INestApplication } from "@nestjs/common";
import request from "supertest";

import {
  createOrdersControllerTestingApp,
  OrdersControllerTestMocks,
} from "../orders-controller-test.helpers";

describe("CountOrderController", () => {
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
    mocks.listOrdersUseCase.executeAll.mockResolvedValue(mockOrder);

    const response = await request(nestApplication.getHttpServer())
      .get("/orders/count")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ quantity: 1 });
  });
});
