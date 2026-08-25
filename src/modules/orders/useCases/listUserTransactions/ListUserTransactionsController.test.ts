import { INestApplication } from "@nestjs/common";
import request from "supertest";

import {
  createOrdersControllerTestingApp,
  OrdersControllerTestMocks,
} from "../orders-controller-test.helpers";

describe("ListUserTransactionsController", () => {
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

  it("should list user transactions and return 200", async () => {
    const mockResponse = {
      items: [
        {
          id: 1,
          order_id: 10,
          type: "PAYMENT",
          amount: 50,
          accountPaymentState: "PARCIALMENTE_PAGO",
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };

    mocks.listUserTransactionsUseCase.execute.mockResolvedValue(mockResponse);

    const response = await request(nestApplication.getHttpServer())
      .get("/users/1/transactions")
      .query({ page: 1, limit: 20, sort: "date_desc", order_id: 10 })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockResponse);
    expect(mocks.listUserTransactionsUseCase.execute).toHaveBeenCalledWith({
      userId: 1,
      page: 1,
      limit: 20,
      sort: "date_desc",
      orderId: 10,
    });
  });
});
