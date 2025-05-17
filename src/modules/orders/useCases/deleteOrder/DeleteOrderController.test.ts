import express from "express";
import request from "supertest";
import { container } from "tsyringe";

import { app } from "@shared/infra/http/app";

import { DeleteOrderController } from "./DeleteOrderController";

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
  () => {
    return {
      ensureAuthenticated: (req: any, res: any, next: any) => next(),
    };
  }
);

describe("DeleteOrderController", () => {
  // const app = express();
  app.use(express.json());

  const mockExecute = jest.fn();
  const mockDeleteOrderUseCase = { execute: mockExecute };

  beforeAll(() => {
    // Registra a rota com o controller
    const controller = new DeleteOrderController();
    app.post("/delete-order", (req, res) => controller.handle(req, res));
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (container.resolve as jest.Mock).mockReturnValue(mockDeleteOrderUseCase);
  });

  it("should call DeleteOrderUseCase with correct ID and return 201", async () => {
    const mockOrder = { id: 1, gasAmount: 1, waterAmount: 1, total: 15 };
    mockExecute.mockResolvedValue(mockOrder);

    const response = await request(app)
      .delete("/orders/1")
      .set("Authorization", `Bearer token`);

    expect(mockExecute).toHaveBeenCalled();
    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockOrder);
  });

  // TODO: Controller deve validar se a string contém um número
  // it("should return 400 if schema validation fails", async () => {
  //   const response = await request(app)
  //     .delete("/orders/test")
  //     .set("Authorization", `Bearer token`);

  //   expect(response.status).toBe(400);
  //   expect(response.body.message).toBeDefined(); // depende do seu util `validateSchema`
  // });
});
