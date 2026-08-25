import request from "supertest";

import { app } from "@shared/infra/http/app";

import { mockListUsersUseCase } from "../../../../../jest/mocks/useCaseMocks";

jest.mock(
  "../../../../shared/infra/http/middlewares/ensureAuthenticated",
  () => ({
    ensureAuthenticated: (req: any, res: any, next: any) => {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token de acesso requerido" });
      }

      req.user = { id: 1 };
      return next();
    },
  })
);

jest.mock("../../../../shared/infra/http/middlewares/ensureAdmin", () => ({
  ensureAdmin: (req: any, res: any, next: any) => next(),
}));

describe("ListUsersController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should list users and return 200", async () => {
    const mockResponse = {
      users: [
        {
          id: 1,
          username: "João Silva",
          email: "joao@test.com",
          telephone: "81999999999",
          role: "USER",
          created_at: new Date("2024-01-01").toISOString(),
          addresses: [],
          accountSummary: {
            openBalance: 100,
            openAccountsCount: 1,
            overdueAccountsCount: 0,
          },
        },
      ],
      total: 1,
      page: 1,
      totalPages: 1,
    };

    mockListUsersUseCase.execute.mockResolvedValue(mockResponse);

    const response = await request(app)
      .get("/users/list/1/10")
      .query({ page: 1, limit: 10, search: "João" })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockResponse);
    expect(mockListUsersUseCase.execute).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      search: "João",
      sort: "highest_debt_first",
    });
  });

  it("should return 401 without authorization token", async () => {
    const response = await request(app).get("/users/list/1/10");

    expect(response.status).toBe(401);
  });
});
