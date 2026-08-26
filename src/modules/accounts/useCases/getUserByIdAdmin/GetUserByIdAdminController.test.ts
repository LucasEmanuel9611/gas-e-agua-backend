import { INestApplication } from "@nestjs/common";
import request from "supertest";

import { AppError } from "@shared/errors/AppError";

import { createUsersControllerTestingApp } from "../users-controller-test.helpers";

describe("GetUserByIdAdminController", () => {
  let nestApplication: INestApplication;
  let mockExecute: jest.Mock;

  beforeAll(async () => {
    const testingApp = await createUsersControllerTestingApp();
    nestApplication = testingApp.nestApplication;
    mockExecute = testingApp.mocks.getUserByIdAdminUseCase.execute;
  });

  afterAll(async () => {
    await nestApplication.close();
  });

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

    mockExecute.mockResolvedValue(mockUser);

    const response = await request(nestApplication.getHttpServer())
      .get("/users/1")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUser);
    expect(mockExecute).toHaveBeenCalledWith(1);
  });

  it("should return 404 when user is not found", async () => {
    mockExecute.mockRejectedValue(
      new AppError({
        message: "Usuário não encontrado",
        statusCode: 404,
      })
    );

    const response = await request(nestApplication.getHttpServer())
      .get("/users/999")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Usuário não encontrado");
  });
});
