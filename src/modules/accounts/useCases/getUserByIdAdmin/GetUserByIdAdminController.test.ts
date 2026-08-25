import request from "supertest";

import { app } from "@shared/infra/http/app";

import { mockGetUserByIdAdminUseCase } from "../../../../../jest/mocks/useCaseMocks";

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

describe("GetUserByIdAdminController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return user by id and status 200", async () => {
    const mockUser = {
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
    };

    mockGetUserByIdAdminUseCase.execute.mockResolvedValue(mockUser);

    const response = await request(app)
      .get("/users/1")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUser);
    expect(mockGetUserByIdAdminUseCase.execute).toHaveBeenCalledWith(1);
  });

  it("should return 404 when user is not found", async () => {
    const { AppError } = await import("@shared/errors/AppError");

    mockGetUserByIdAdminUseCase.execute.mockRejectedValue(
      new AppError({
        message: "Usuário não encontrado",
        statusCode: 404,
      })
    );

    const response = await request(app)
      .get("/users/999")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Usuário não encontrado");
  });
});
