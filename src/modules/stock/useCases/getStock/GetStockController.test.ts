import request from "supertest";

import { app } from "@shared/infra/http/app";

import { mockGetStockUseCase } from "../../../../../jest/mocks/useCaseMocks";

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

describe("GetStockController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return all stock items with status 201", async () => {
    const items = [
      { id: 1, name: "Gás", quantity: 10, value: 10.0 },
      { id: 2, name: "Água", quantity: 20, value: 5.0 },
    ];

    mockGetStockUseCase.execute.mockResolvedValue(items);

    const response = await request(app)
      .get("/stock/")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(201);
    expect(response.body.items).toEqual(items);
  });

  it("should return empty array when no items exist", async () => {
    mockGetStockUseCase.execute.mockResolvedValue(undefined);

    const response = await request(app)
      .get("/stock/")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(201);
    expect(response.body.items).toEqual([]);
  });

  it("should return 500 when UseCase throws an error", async () => {
    mockGetStockUseCase.execute.mockRejectedValue(new Error("Unexpected"));

    const response = await request(app)
      .get("/stock/")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Erro interno do servidor");
  });
});
