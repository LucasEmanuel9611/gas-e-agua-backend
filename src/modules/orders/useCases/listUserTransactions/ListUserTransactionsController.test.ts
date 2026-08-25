import request from "supertest";

import { app } from "@shared/infra/http/app";

import { mockListUserTransactionsUseCase } from "../../../../../jest/mocks/useCaseMocks";

jest.mock(
  "../../../../shared/infra/http/middlewares/ensureAuthenticated",
  () => ({
    ensureAuthenticated: (req: any, res: any, next: any) => {
      req.user = { id: 1 };
      next();
    },
  })
);

jest.mock("../../../../shared/infra/http/middlewares/ensureAdmin", () => ({
  ensureAdmin: (req: any, res: any, next: any) => next(),
}));

describe("ListUserTransactionsController", () => {
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

    mockListUserTransactionsUseCase.execute.mockResolvedValue(mockResponse);

    const response = await request(app)
      .get("/users/1/transactions")
      .query({ page: 1, limit: 20, sort: "date_desc", order_id: 10 })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockResponse);
    expect(mockListUserTransactionsUseCase.execute).toHaveBeenCalledWith({
      userId: 1,
      page: 1,
      limit: 20,
      sort: "date_desc",
      orderId: 10,
    });
  });
});
