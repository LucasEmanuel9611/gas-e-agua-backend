import { INestApplication } from "@nestjs/common";
import request from "supertest";

import { AppError } from "@shared/errors/AppError";

import { createUsersControllerTestingApp } from "../users-controller-test.helpers";

describe("ProfileUserController", () => {
  let nestApplication: INestApplication;
  let mockExecute: jest.Mock;

  beforeAll(async () => {
    const testingApp = await createUsersControllerTestingApp({ userId: "5" });
    nestApplication = testingApp.nestApplication;
    mockExecute = testingApp.mocks.profileUserUseCase.execute;
  });

  afterAll(async () => {
    await nestApplication.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return user profile successfully", async () => {
    const mockUser = {
      id: 5,
      username: "testuser",
      email: "test@example.com",
      telephone: "81999999999",
      address: {
        street: "Test Street",
        number: "123",
        reference: "Test Reference",
        local: "Test City",
      },
    };

    mockExecute.mockResolvedValue(mockUser);

    const response = await request(nestApplication.getHttpServer())
      .get("/users/profile")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUser);
  });

  it("should return 400 when user is not found", async () => {
    mockExecute.mockRejectedValue(
      new AppError({ message: "Usuário não encontrado", statusCode: 400 })
    );

    const response = await request(nestApplication.getHttpServer())
      .get("/users/profile")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Usuário não encontrado");
  });

  it("should return 500 when UseCase throws unexpected error", async () => {
    mockExecute.mockRejectedValue(new Error("Database error"));

    const response = await request(nestApplication.getHttpServer())
      .get("/users/profile")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Erro interno do servidor");
  });
});
