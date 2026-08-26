import { INestApplication } from "@nestjs/common";
import request from "supertest";

import {
  createOrdersControllerTestingApp,
  OrdersControllerTestMocks,
} from "../orders-controller-test.helpers";

describe("ListUserOrdersController", () => {
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

  it("should list user accounts and return 200", async () => {
    const mockAccounts = [
      {
        id: 2,
        user_id: 1,
        payment_state: "VENCIDO",
        total: 100,
        updated_at: "2024-01-01T00:00:00.000Z",
        transactions: [],
      },
      {
        id: 1,
        user_id: 1,
        payment_state: "PAGO",
        total: 0,
        updated_at: "2024-03-01T00:00:00.000Z",
        transactions: [],
      },
    ];

    mocks.listUserOrdersUseCase.execute.mockResolvedValue(mockAccounts);

    const response = await request(nestApplication.getHttpServer())
      .get("/users/1/orders")
      .query({ sort: "unpaid_first" })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockAccounts);
    expect(mocks.listUserOrdersUseCase.execute).toHaveBeenCalledWith({
      userId: "1",
      sort: "unpaid_first",
    });
  });
});
