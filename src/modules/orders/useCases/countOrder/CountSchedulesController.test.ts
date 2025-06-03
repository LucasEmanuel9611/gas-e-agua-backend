import request from "supertest";

import { app } from "@shared/infra/http/app";

import { mockListOrdersUseCase } from "../../../../../jest/mocks/useCaseMocks";
import { CountOrderController } from "./CountSchedulesController";

describe("CountOrderController", () => {
  beforeAll(() => {
    const controller = new CountOrderController();
    app.get("/orders/count", controller.handle.bind(controller));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return the total count of orders", async () => {
    const mockOrders = [
      { id: 1, user_id: 5, gasAmount: 2, waterAmount: 3, total: 50 },
      { id: 2, user_id: 6, gasAmount: 1, waterAmount: 1, total: 30 },
    ];

    mockListOrdersUseCase.mockResolvedValue(mockOrders);

    const response = await request(app)
      .get("/orders/count")
      .set("Authorization", "Bearer token");

    expect(mockListOrdersUseCase).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ quantity: mockOrders.length });
  });

  it("should return zero when there are no orders", async () => {
    mockListOrdersUseCase.mockResolvedValue([]);

    const response = await request(app)
      .get("/orders/count")
      .set("Authorization", "Bearer token");

    expect(mockListOrdersUseCase).toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ quantity: 0 });
  });
});
