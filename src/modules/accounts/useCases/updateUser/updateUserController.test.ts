import request from "supertest";
import { container } from "tsyringe";

import { app } from "@shared/infra/http/app";

import { UpdateUserController } from "./updateUserController";

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
        req.user = { id: "123" };
        next();
      },
    };
  }
);

describe("UpdateUserController", () => {
  beforeAll(() => {
    const controller = new UpdateUserController();
    app.put("/users/profile", controller.handle.bind(controller));
  });

  it("should return 200 and updated user data when update is successful", async () => {
    const mockUserData = {
      username: "updatedUser",
      telephone: "11987654321",
      address: {
        street: "New Street",
        number: "456",
        reference: "New Reference",
        local: "New City",
      },
    };

    jest.spyOn(container, "resolve").mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue({
        id: 123,
        username: "updatedUser",
        role: "USER",
        notificationTokens: [],
      }),
    }));

    const response = await request(app)
      .put("/users/profile")
      .set("Authorization", "Bearer token")
      .send(mockUserData);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 123,
      username: "updatedUser",
      role: "USER",
      notificationTokens: [],
    });
  });

  it("should return 200 when updating only username", async () => {
    const mockUserData = {
      username: "newUsername",
    };

    jest.spyOn(container, "resolve").mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue({
        id: 123,
        username: "newUsername",
        role: "USER",
        notificationTokens: [],
      }),
    }));

    const response = await request(app)
      .put("/users/profile")
      .set("Authorization", "Bearer token")
      .send(mockUserData);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 123,
      username: "newUsername",
      role: "USER",
      notificationTokens: [],
    });
  });

  it("should return 200 when updating only telephone", async () => {
    const mockUserData = {
      telephone: "11987654321",
    };

    jest.spyOn(container, "resolve").mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue({
        id: 123,
        username: "existingUser",
        role: "USER",
        notificationTokens: [],
      }),
    }));

    const response = await request(app)
      .put("/users/profile")
      .set("Authorization", "Bearer token")
      .send(mockUserData);

    expect(response.status).toBe(200);
  });

  it("should return 400 when username is too short", async () => {
    const mockUserData = {
      username: "ab",
    };

    const response = await request(app)
      .put("/users/profile")
      .set("Authorization", "Bearer token")
      .send(mockUserData);

    expect(response.status).toBe(400);
    expect(response.body.message).toContain(
      "O nome de usuário deve ter pelo menos 3 caracteres"
    );
  });

  it("should return 400 when telephone has invalid length", async () => {
    const mockUserData = {
      telephone: "123456789",
    };

    const response = await request(app)
      .put("/users/profile")
      .set("Authorization", "Bearer token")
      .send(mockUserData);

    expect(response.status).toBe(400);
    expect(response.body.message).toContain(
      "O número de telefone deve ter exatamente 11 dígitos"
    );
  });

  it("should return 400 when address fields are invalid", async () => {
    const mockUserData = {
      address: {
        street: "",
        number: "12345678901",
      },
    };

    const response = await request(app)
      .put("/users/profile")
      .set("Authorization", "Bearer token")
      .send(mockUserData);

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("A rua não pode ser vazia");
  });

  it.each([
    [{ role: "ADMIN" }, "role"],
    [{ email: "newemail@example.com" }, "email"],
    [{ password: "newpassword123" }, "password"],
    [{ id: 999 }, "id"],
    [
      {
        role: "ADMIN",
        email: "newemail@example.com",
        password: "newpassword123",
        id: 999,
      },
      "múltiplos campos proibidos",
    ],
    [
      {
        username: "validUsername",
        telephone: "11987654321",
        extraField: "some value",
        anotherField: 123,
        randomData: { foo: "bar" },
      },
      "campos extras",
    ],
    [
      {
        username: "validUsername",
        telephone: "11987654321",
        address: {
          street: "Valid Street",
          reference: "Valid Reference",
          local: "Valid City",
        },
        createdAt: "2023-01-01",
        isActive: true,
        preferences: { theme: "dark" },
      },
      "campos extras junto com válidos",
    ],
  ])(
    "should return 400 when trying to update forbidden or extra fields: %s",
    async (mockUserData, _) => {
      const response = await request(app)
        .put("/users/profile")
        .set("Authorization", "Bearer token")
        .send(mockUserData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain(
        "Campos não permitidos para atualização"
      );
    }
  );

  it("should return 500 if useCase throws an error", async () => {
    const mockUserData = {
      username: "updatedUser",
    };

    jest.spyOn(container, "resolve").mockImplementation(() => ({
      execute: jest.fn().mockRejectedValue(new Error("Internal server error")),
    }));

    const response = await request(app)
      .put("/users/profile")
      .set("Authorization", "Bearer token")
      .send(mockUserData);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Erro interno do servidor");
  });
});
