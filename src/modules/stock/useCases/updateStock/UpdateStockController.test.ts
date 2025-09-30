import request from "supertest";

import { AppError } from "@shared/errors/AppError";
import { app } from "@shared/infra/http/app";

import { mockUpdateStockUseCase } from "../../../../../jest/mocks/useCaseMocks";

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
        req.user = { id: 5 };
        next();
      },
    };
  }
);

describe("UpdateStockController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update a stock item successfully", async () => {
    const updatedItem = {
      id: 1,
      name: "Gás",
      quantity: 15,
      value: 10.0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockUpdateStockUseCase.execute.mockResolvedValue(updatedItem);

    const response = await request(app)
      .put("/stock/1")
      .send({ quantity: 15, value: 10.0 })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(201);
    expect(response.body).toEqual(updatedItem);
  });

  it("should return 400 for invalid data", async () => {
    const response = await request(app)
      .put("/stock/1")
      .send({ quantity: -1 })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(400);
  });

  it("should return the correct status code when UseCase throws AppError", async () => {
    mockUpdateStockUseCase.execute.mockImplementation(() => {
      throw new AppError({ message: "Item não encontrado", statusCode: 404 });
    });

    const response = await request(app)
      .put("/stock/999")
      .send({ quantity: 10 })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Item não encontrado");
  });

  it("should return 500 when UseCase throws unexpected error", async () => {
    mockUpdateStockUseCase.execute.mockRejectedValue(
      new Error("Unexpected error")
    );

    const response = await request(app)
      .put("/stock/1")
      .send({ quantity: 10 })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Erro interno do servidor");
  });
});
