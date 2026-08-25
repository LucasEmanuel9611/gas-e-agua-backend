import { INestApplication } from "@nestjs/common";
import request from "supertest";

import { AppError } from "@shared/errors/AppError";

import { createUsersControllerTestingApp } from "../users-controller-test.helpers";

describe("CreateAddressController", () => {
  let nestApplication: INestApplication;
  let mockExecute: jest.Mock;

  beforeAll(async () => {
    const testingApp = await createUsersControllerTestingApp({ userId: "123" });
    nestApplication = testingApp.nestApplication;
    mockExecute = testingApp.mocks.createAddressUseCase.execute;
  });

  afterAll(async () => {
    await nestApplication.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create address successfully and return 201", async () => {
    const mockCreatedAddress = {
      id: 1,
      street: "Rua Teste",
      number: "123",
      reference: "Próximo ao shopping",
      local: "São Paulo",
      user_id: 123,
      isDefault: true,
    };

    mockExecute.mockResolvedValue(mockCreatedAddress);

    const response = await request(nestApplication.getHttpServer())
      .post("/users/addresses")
      .set("Authorization", "Bearer token")
      .send({
        street: "Rua Teste",
        number: "123",
        reference: "Próximo ao shopping",
        local: "São Paulo",
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockCreatedAddress);
  });

  it("should return 400 if useCase throws an error", async () => {
    mockExecute.mockRejectedValue(
      new AppError({
        message: "Usuário pode ter no máximo 5 endereços",
        statusCode: 400,
      })
    );

    const response = await request(nestApplication.getHttpServer())
      .post("/users/addresses")
      .set("Authorization", "Bearer token")
      .send({
        street: "Rua Teste",
        number: "123",
        reference: "Próximo ao shopping",
        local: "São Paulo",
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Usuário pode ter no máximo 5 endereços",
    });
  });
});
