import { INestApplication } from "@nestjs/common";
import request from "supertest";

import { AppError } from "@shared/errors/AppError";

import { createUsersControllerTestingApp } from "../users-controller-test.helpers";

describe("UpdateAddressController", () => {
  let nestApplication: INestApplication;
  let mockExecute: jest.Mock;

  beforeAll(async () => {
    const testingApp = await createUsersControllerTestingApp({ userId: "123" });
    nestApplication = testingApp.nestApplication;
    mockExecute = testingApp.mocks.updateAddressUseCase.execute;
  });

  afterAll(async () => {
    await nestApplication.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update address successfully and return 200", async () => {
    const mockUpdatedAddress = {
      id: 456,
      street: "Rua Atualizada",
      number: "456",
      reference: "Próximo ao shopping",
      local: "São Paulo",
      user_id: 123,
    };

    mockExecute.mockResolvedValue(mockUpdatedAddress);

    const response = await request(nestApplication.getHttpServer())
      .put("/users/addresses/456")
      .set("Authorization", "Bearer token")
      .send({
        street: "Rua Atualizada",
        number: "456",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUpdatedAddress);
  });

  it("should return 404 if address not found", async () => {
    mockExecute.mockRejectedValue(
      new AppError({
        message: "Endereço não encontrado",
        statusCode: 404,
      })
    );

    const response = await request(nestApplication.getHttpServer())
      .put("/users/addresses/999")
      .set("Authorization", "Bearer token")
      .send({
        street: "Rua Atualizada",
        number: "456",
      });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      message: "Endereço não encontrado",
    });
  });
});
