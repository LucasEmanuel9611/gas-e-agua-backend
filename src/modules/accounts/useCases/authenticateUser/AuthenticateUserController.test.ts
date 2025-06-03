import request from "supertest";
import { container } from "tsyringe";

import { app } from "@shared/infra/http/app";

import { AuthenticateUserController } from "./AuthenticateUserController";

jest.mock("tsyringe", () => {
  const actual = jest.requireActual("tsyringe");
  return {
    ...actual,
    container: {
      resolve: jest.fn(),
    },
  };
});

describe("AuthenticateUserController", () => {
  beforeAll(() => {
    const controller = new AuthenticateUserController();
    app.post("/users/authenticate", controller.handle.bind(controller));
  });

  it("should authenticate user and return token", async () => {
    const mockResponse = {
      token: "fake_token",
      user: {
        name: "testUser",
        email: "test@example.com",
        isAdmin: false,
        id: 123,
        address: {
          street: "Test Street",
          number: "123",
          reference: "Test Reference",
          local: "Test City",
        },
      },
    };

    jest.spyOn(container, "resolve").mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue(mockResponse),
    }));

    const response = await request(app).post("/users/authenticate").send({
      email: "test@example.com",
      password: "123456",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockResponse);
  });

  it("should return 400 if email is invalid", async () => {
    const response = await request(app).post("/users/authenticate").send({
      email: "invalid-email",
      password: "123456",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("O e-mail fornecido é inválido.");
  });

  it("should return 400 if password is too short", async () => {
    const response = await request(app).post("/users/authenticate").send({
      email: "test@example.com",
      password: "123",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "A senha deve ter pelo menos 6 dígitos."
    );
  });

  it("should return 500 if useCase throws an error", async () => {
    jest.spyOn(container, "resolve").mockImplementation(() => ({
      execute: jest
        .fn()
        .mockRejectedValue(new Error("Erro interno do servidor")),
    }));

    const response = await request(app).post("/users/authenticate").send({
      email: "test@example.com",
      password: "123456",
    });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Erro interno do servidor");
  });
});
