import request from "supertest";
import { container } from "tsyringe";

import { app } from "@shared/infra/http/app";

import { CreateStockItemController } from "./CreateStockItemController";

jest.mock("tsyringe", () => {
  const actual = jest.requireActual("tsyringe");
  return {
    ...actual,
    container: {
      resolve: jest.fn(),
      registerSingleton: jest.fn(),
    },
  };
});

jest.mock(
  "../../../../shared/infra/http/middlewares/ensureAuthenticated",
  () => ({
    ensureAuthenticated: (req: any, res: any, next: any) => next(),
  })
);

jest.mock("../../../../shared/infra/http/middlewares/ensureAdmin", () => ({
  ensureAdmin: (req: any, res: any, next: any) => next(),
}));

describe("CreateStockItemController", () => {
  const mockExecute = jest.fn();
  const mockCreateStockItemUseCase = { execute: mockExecute };

  beforeAll(() => {
    const controller = new CreateStockItemController();
    app.post("/stock", (req, res) => controller.handle(req, res));
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (container.resolve as jest.Mock).mockReturnValue(
      mockCreateStockItemUseCase
    );
  });

  it("should create a stock item and return 201", async () => {
    mockExecute.mockResolvedValue(undefined); // .execute não retorna nada

    const payload = {
      name: "Gás",
      quantity: 10,
      value: 89.9,
    };

    const response = await request(app)
      .post("/stock")
      .send(payload)
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(201);
    expect(response.body).toEqual(payload);
    expect(mockExecute).toHaveBeenCalledWith(payload);
  });

  it("should return 400 if input is invalid", async () => {
    const response = await request(app)
      .post("/stock")
      .send({ name: "", quantity: -5, value: "invalid" })
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
  });
});
