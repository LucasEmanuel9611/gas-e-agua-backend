import { INestApplication } from "@nestjs/common";
import request from "supertest";

import {
  createOrdersControllerTestingApp,
  OrdersControllerTestMocks,
} from "../orders-controller-test.helpers";

describe("ConcludeOrderController", () => {
  let nestApplication: INestApplication;
  let mocks: OrdersControllerTestMocks;

  beforeAll(async () => {
    const testingApp = await createOrdersControllerTestingApp();
    nestApplication = testingApp.nestApplication;
    mocks = testingApp.mocks;
  });

  afterAll(async () => {
    await nestApplication.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update order status successfully", async () => {
    const mockOrder = {
      id: 123,
      user_id: 456,
      status: "FINALIZADO",
      payment_state: "PAGO",
      gasAmount: 1,
      waterAmount: 1,
      updated_at: new Date().toISOString(),
      total: 100,
      address: {
        street: "Test Street",
        number: "123",
        reference: "Test Reference",
        local: "Test City",
      },
      user: {
        username: "testUser",
        telephone: "81999999999",
      },
    };

    mocks.concludeOrderUseCase.execute.mockResolvedValue(mockOrder);

    const response = await request(nestApplication.getHttpServer())
      .put("/orders/123/conclude")
      .set("Authorization", "Bearer token")
      .send({
        status: "FINALIZADO",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockOrder);
  });

  it("should return 400 if status is invalid", async () => {
    const response = await request(nestApplication.getHttpServer())
      .put("/orders/123/conclude")
      .set("Authorization", "Bearer token")
      .send({
        order_id: "123",
        status: "INVALID_STATUS",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Status inválido.");
  });

  it("should return 500 if useCase throws an error", async () => {
    mocks.concludeOrderUseCase.execute.mockRejectedValue(
      new Error("Erro interno do servidor")
    );

    const response = await request(nestApplication.getHttpServer())
      .put("/orders/123/conclude")
      .set("Authorization", "Bearer token")
      .send({
        status: "FINALIZADO",
      });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Erro interno do servidor");
  });
});
