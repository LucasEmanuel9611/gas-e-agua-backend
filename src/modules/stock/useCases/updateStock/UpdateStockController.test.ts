import request from "supertest";

import { app } from "@shared/infra/http/app";

import { mockUpdateStockUseCase } from "../../../../../jest/mocks/useCaseMocks";

jest.mock("tsyringe", () => {
  const actual = jest.requireActual("tsyringe");
  return {
    ...actual,
    container: {
      resolve: jest.fn(() => ({
        execute: mockUpdateStockUseCase,
      })),
    },
  };
});

jest.mock(
  "../../../../shared/infra/http/middlewares/ensureAuthenticated",
  () => {
    return {
      ensureAuthenticated: (req: any, res: any, next: any) => {
        req.user = { id: 1 };
        next();
      },
    };
  }
);

describe("UpdateStockController (integration)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update stock successfully and return 201", async () => {
    const updatedItem = {
      id: 1,
      name: "Água",
      quantity: 100,
      value: 12,
    };

    mockUpdateStockUseCase.mockResolvedValue(updatedItem);

    const response = await request(app)
      .put("/stock/update/1")
      .set("Authorization", "Bearer mocktoken")
      .send({ name: "Água", quantity: 100, value: 12 });

    expect(mockUpdateStockUseCase).toHaveBeenCalledWith({
      id: 1,
      newData: { name: "Água", quantity: 100, value: 12 },
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(updatedItem);
  });

  it("should return 400 for invalid name", async () => {
    const response = await request(app)
      .put("/stock/update/1")
      .set("Authorization", "Bearer mocktoken")
      .send({ name: "A" }); // nome inválido (menos de 2 caracteres)

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("nome");
  });

  it("should return 400 for invalid quantity (negative)", async () => {
    const response = await request(app)
      .put("/stock/update/1")
      .set("Authorization", "Bearer mocktoken")
      .send({ quantity: -10 });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("quantidade");
  });

  it("should return 400 for invalid value (zero)", async () => {
    const response = await request(app)
      .put("/stock/update/1")
      .set("Authorization", "Bearer mocktoken")
      .send({ value: 0 });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("valor");
  });

  it("should return 500 if use case throws", async () => {
    mockUpdateStockUseCase.mockRejectedValue(new Error("Unexpected error"));

    const response = await request(app)
      .put("/stock/update/1")
      .set("Authorization", "Bearer mocktoken")
      .send({ name: "Gás", quantity: 10 });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Erro interno do servidor");
  });
});
