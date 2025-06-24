import request from "supertest";

import { app } from "@shared/infra/http/app";

import { mockGetStockUseCase } from "../../../../../jest/mocks/useCaseMocks";

jest.mock("tsyringe", () => {
  const actual = jest.requireActual("tsyringe");
  return {
    ...actual,
    container: {
      resolve: jest.fn(() => ({ execute: mockGetStockUseCase })),
      registerSingleton: jest.fn(),
    },
  };
});

jest.mock(
  "../../../../shared/infra/http/middlewares/ensureAuthenticated",
  () => ({
    ensureAuthenticated: (req: any, res: any, next: any) => {
      req.user = { id: 1 };
      next();
    },
  })
);

describe("GetStockController (integration)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 201 and all stock items", async () => {
    const items = [
      { id: 1, name: "Gás", quantity: 10, value: 80 },
      { id: 2, name: "Água", quantity: 20, value: 5 },
    ];
    mockGetStockUseCase.mockResolvedValue(items);

    const response = await request(app)
      .get("/stock/")
      .set("Authorization", "Bearer valid-token");

    expect(mockGetStockUseCase).toHaveBeenCalled();
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ items });
  });

  it("should return 201 and empty array when use case returns undefined", async () => {
    mockGetStockUseCase.mockResolvedValue(undefined);

    const response = await request(app)
      .get("/stock/")
      .set("Authorization", "Bearer valid-token");

    expect(mockGetStockUseCase).toHaveBeenCalled();
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ items: [] });
  });

  it("should return 500 if use case throws", async () => {
    mockGetStockUseCase.mockRejectedValue(new Error("Unexpected"));

    const response = await request(app)
      .get("/stock/")
      .set("Authorization", "Bearer valid-token");

    expect(mockGetStockUseCase).toHaveBeenCalled();
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("message");
  });
});
