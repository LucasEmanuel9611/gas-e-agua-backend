import { INestApplication } from "@nestjs/common";
import request from "supertest";

import { createUsersControllerTestingApp } from "../users-controller-test.helpers";

describe("DeleteAddressController", () => {
  let nestApplication: INestApplication;
  let mockExecute: jest.Mock;

  beforeAll(async () => {
    const testingApp = await createUsersControllerTestingApp({ userId: "123" });
    nestApplication = testingApp.nestApplication;
    mockExecute = testingApp.mocks.deleteAddressUseCase.execute;
  });

  afterAll(async () => {
    await nestApplication.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete address successfully and return 204", async () => {
    mockExecute.mockResolvedValue(undefined);

    const response = await request(nestApplication.getHttpServer())
      .delete("/users/addresses/456")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(204);
  });

  it("should return 500 if useCase throws an error", async () => {
    mockExecute.mockRejectedValue(new Error("Internal server error"));

    const response = await request(nestApplication.getHttpServer())
      .delete("/users/addresses/456")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Erro interno do servidor");
  });
});
