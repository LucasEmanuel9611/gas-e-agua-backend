import request from "supertest";

import { AppError } from "@shared/errors/AppError";
import { app } from "@shared/infra/http/app";

import { mockProfileUserUseCase } from "../../../../../jest/mocks/useCaseMocks";

jest.mock("tsyringe", () => {
  const actual = jest.requireActual("tsyringe");
  return {
    ...actual,
    container: {
      resolve: jest.fn(),
    },
  };
});

jest.mock(
  "../../../../shared/infra/http/middlewares/ensureAuthenticated",
  () => {
    return {
      ensureAuthenticated: (req: any, res: any, next: any) => {
        req.user = { id: 5 };
        next();
      },
    };
  }
);

describe("ProfileUserController", () => {
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

    mockProfileUserUseCase.execute.mockResolvedValue(mockUser);

    const response = await request(app)
      .get("/users/profile")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUser);
  });

  it("should return 400 when user is not found", async () => {
    mockProfileUserUseCase.execute.mockRejectedValue(
      new AppError("Usuário não encontrado", 400)
    );

    const response = await request(app)
      .get("/users/profile")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Usuário não encontrado");
  });

  it("should return 500 when UseCase throws unexpected error", async () => {
    mockProfileUserUseCase.execute.mockRejectedValue(
      new Error("Database error")
    );

    const response = await request(app)
      .get("/users/profile")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Erro interno do servidor");
  });
});
