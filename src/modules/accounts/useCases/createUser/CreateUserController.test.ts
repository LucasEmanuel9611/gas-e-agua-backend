import { INestApplication } from "@nestjs/common";
import request from "supertest";

import { createUsersControllerTestingApp } from "../users-controller-test.helpers";

describe("CreateUserController", () => {
  let nestApplication: INestApplication;
  let mockExecute: jest.Mock;

  beforeAll(async () => {
    const testingApp = await createUsersControllerTestingApp();
    nestApplication = testingApp.nestApplication;
    mockExecute = testingApp.mocks.createUserUseCase.execute;
  });

  afterAll(async () => {
    await nestApplication.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 201 and call UseCase when data is valid", async () => {
    mockExecute.mockResolvedValue(undefined);

    const payload = {
      username: "validUser",
      email: "valid@example.com",
      password: "123456",
      telephone: "11999999999",
      address: {
        street: "Av Teste",
        reference: "Perto do mercado",
        local: "Cidade X",
        number: "123",
      },
    };

    const response = await request(nestApplication.getHttpServer())
      .post("/users")
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      username: "validUser",
      email: "valid@example.com",
      password: "123456",
      address: {
        street: "Av Teste",
        reference: "Perto do mercado",
        local: "Cidade X",
        number: "123",
      },
    });
  });

  it("should return 400 with friendly message if required address fields are missing", async () => {
    const response = await request(nestApplication.getHttpServer())
      .post("/users")
      .send({
        username: "us",
        email: "invalid-email",
        password: "123",
        telephone: "123",
        address: {},
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("É obrigatória uma referência");
    expect(response.body.message).toContain("Local é obrigatório");
    expect(response.body.message).toContain(
      "O nome de usuário deve ter pelo menos 3 caracteres"
    );
    expect(response.body.message).toContain("O e-mail fornecido é inválido");
    expect(response.body.message).toContain(
      "A senha deve ter pelo menos 6 dígitos"
    );
    expect(response.body.message).toContain(
      "O número de telefone deve ter exatamente 11 dígitos"
    );
  });
});
