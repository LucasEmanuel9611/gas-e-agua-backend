import request from "supertest";

import { app } from "@shared/infra/http/app";

import { mockListUserOrdersUseCase } from "../../../../../jest/mocks/useCaseMocks";

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

describe("ListUserOrdersController", () => {
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

    mockListUserOrdersUseCase.execute.mockResolvedValue(mockAccounts);

    const response = await request(app)
      .get("/users/1/orders")
      .query({ sort: "open_first" })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockAccounts);
    expect(mockListUserOrdersUseCase.execute).toHaveBeenCalledWith({
      userId: "1",
      sort: "open_first",
    });
  });
});
