import request from "supertest";
import { container } from "tsyringe";

import { app } from "@shared/infra/http/app";

import { CreateAddonController } from "./CreateAddonController";

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

describe("CreateAddonController", () => {
  const mockExecute = jest.fn();
  const mockCreateAddonUseCase = { execute: mockExecute };

  beforeAll(() => {
    const controller = new CreateAddonController();
    app.post("/addons", (req, res) => controller.handle(req, res));
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (container.resolve as jest.Mock).mockReturnValue(mockCreateAddonUseCase);
  });

  it("should create an addon and return 201", async () => {
    const mockAddon = {
      id: 1,
      name: "Botijão para Água",
      value: 15.0,
    };

    mockExecute.mockResolvedValue(mockAddon);

    const payload = {
      name: "Botijão para Água",
      value: 15.0,
    };

    const response = await request(app)
      .post("/addons")
      .send(payload)
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockAddon);
    expect(mockExecute).toHaveBeenCalledWith(payload);
  });

  it("should return 400 if input is invalid", async () => {
    const response = await request(app)
      .post("/addons")
      .send({ name: "", value: -5 })
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
  });
});
