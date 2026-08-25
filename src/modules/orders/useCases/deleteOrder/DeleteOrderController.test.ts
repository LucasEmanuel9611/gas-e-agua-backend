import { INestApplication } from "@nestjs/common";
import request from "supertest";

import {
  createOrdersControllerTestingApp,
  OrdersControllerTestMocks,
} from "../orders-controller-test.helpers";

describe("DeleteOrderController", () => {
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

  it("should call DeleteOrderUseCase with correct ID and return 201", async () => {
    const mockOrder = { id: 1, gasAmount: 1, waterAmount: 1, total: 15 };
    mocks.deleteOrderUseCase.execute.mockResolvedValue(mockOrder);

    const response = await request(nestApplication.getHttpServer())
      .delete("/orders/1")
      .set("Authorization", `Bearer token`);

    expect(mocks.deleteOrderUseCase.execute).toHaveBeenCalled();
    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockOrder);
  });
});
