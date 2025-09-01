import request from "supertest";
import { container } from "tsyringe";

import { app } from "@shared/infra/http/app";

import { FindAddonsController } from "./FindAddonsController";

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

describe("FindAddonsController", () => {
  const mockExecute = jest.fn();
  const mockFindAddonsUseCase = { execute: mockExecute };

  beforeAll(() => {
    const controller = new FindAddonsController();
    app.get("/addons", (req, res) => controller.handle(req, res));
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (container.resolve as jest.Mock).mockReturnValue(mockFindAddonsUseCase);
  });

  it("should return all addons with status 200", async () => {
    const mockAddons = [
      {
        id: 1,
        name: "Botijão para Água",
        value: 15.0,
      },
      {
        id: 2,
        name: "Botijão para Gás",
        value: 25.0,
      },
    ];

    mockExecute.mockResolvedValue(mockAddons);

    const response = await request(app)
      .get("/addons")
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockAddons);
    expect(mockExecute).toHaveBeenCalled();
  });
});
