import request from "supertest";

import { app } from "@shared/infra/http/app";

import { mockProfileUserUseCase } from "../../../../../jest/mocks/useCaseMocks";
import { ProfileUserController } from "./ProfileUserController";

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
        req.user = { id: 123 };
        next();
      },
    };
  }
);

describe("ProfileUserController", () => {
  beforeAll(() => {
    const controller = new ProfileUserController();
    app.get("/users/profile", controller.handle.bind(controller));
  });

  it("should return the user profile data", async () => {
    const mockUser = {
      id: 123,
      name: "João",
      email: "joao@example.com",
      created_at: new Date().toISOString(),
    };

    mockProfileUserUseCase.mockResolvedValue(mockUser);

    const response = await request(app)
      .get("/users/profile")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUser);
    expect(mockProfileUserUseCase).toHaveBeenCalledWith(123);
  });

  it("should return 500 if useCase throws an error", async () => {
    mockProfileUserUseCase.mockRejectedValue(
      new Error("Erro interno do servidor")
    );

    const response = await request(app)
      .get("/users/profile")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(500);
    expect(response.body.message).toContain("Erro interno do servidor");
  });
});
