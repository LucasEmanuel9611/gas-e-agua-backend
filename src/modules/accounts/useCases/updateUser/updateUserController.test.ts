import { INestApplication } from "@nestjs/common";
import request from "supertest";

import { createUsersControllerTestingApp } from "../users-controller-test.helpers";

describe("UpdateUserController", () => {
  let nestApplication: INestApplication;
  let mockExecute: jest.Mock;

  beforeAll(async () => {
    const testingApp = await createUsersControllerTestingApp({ userId: "123" });
    nestApplication = testingApp.nestApplication;
    mockExecute = testingApp.mocks.updateUserUseCase.execute;
  });

  afterAll(async () => {
    await nestApplication.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
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

    mockExecute.mockResolvedValue({
      id: 123,
      username: "updatedUser",
      role: "USER",
      notificationTokens: [],
    });

    const response = await request(nestApplication.getHttpServer())
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
    mockExecute.mockResolvedValue({
      id: 123,
      username: "newUsername",
      role: "USER",
      notificationTokens: [],
    });

    const response = await request(nestApplication.getHttpServer())
      .put("/users/profile")
      .set("Authorization", "Bearer token")
      .send({ username: "newUsername" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 123,
      username: "newUsername",
      role: "USER",
      notificationTokens: [],
    });
  });

  it("should return 200 when updating only telephone", async () => {
    mockExecute.mockResolvedValue({
      id: 123,
      username: "existingUser",
      role: "USER",
      notificationTokens: [],
    });

    const response = await request(nestApplication.getHttpServer())
      .put("/users/profile")
      .set("Authorization", "Bearer token")
      .send({ telephone: "11987654321" });

    expect(response.status).toBe(200);
  });

  it("should return 400 when username is too short", async () => {
    const response = await request(nestApplication.getHttpServer())
      .put("/users/profile")
      .set("Authorization", "Bearer token")
      .send({ username: "ab" });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain(
      "O nome de usuário deve ter pelo menos 3 caracteres"
    );
  });

  it("should return 400 when telephone has invalid length", async () => {
    const response = await request(nestApplication.getHttpServer())
      .put("/users/profile")
      .set("Authorization", "Bearer token")
      .send({ telephone: "123456789" });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain(
      "O número de telefone deve ter exatamente 11 dígitos"
    );
  });

  it("should return 400 when address fields are invalid", async () => {
    const response = await request(nestApplication.getHttpServer())
      .put("/users/profile")
      .set("Authorization", "Bearer token")
      .send({
        address: {
          street: "",
          number: "12345678901",
        },
      });

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
      const response = await request(nestApplication.getHttpServer())
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
    mockExecute.mockRejectedValue(new Error("Internal server error"));

    const response = await request(nestApplication.getHttpServer())
      .put("/users/profile")
      .set("Authorization", "Bearer token")
      .send({ username: "updatedUser" });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Erro interno do servidor");
  });
});
