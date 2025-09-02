import request from "supertest";
import { container } from "tsyringe";

import { app } from "@shared/infra/http/app";

import { UpdateAddonController } from "./UpdateAddonController";

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

describe("UpdateAddonController", () => {
  const mockExecute = jest.fn();
  const mockUpdateAddonUseCase = { execute: mockExecute };

  beforeAll(() => {
    const controller = new UpdateAddonController();
    app.put("/addons/:id", (req, res) => controller.handle(req, res));
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (container.resolve as jest.Mock).mockReturnValue(mockUpdateAddonUseCase);
  });

  it("should update an addon and return 201", async () => {
    const mockAddon = {
      id: 1,
      name: "Botijão para Água Atualizado",
      value: 20.0,
    };

    mockExecute.mockResolvedValue(mockAddon);

    const payload = {
      name: "Botijão para Água Atualizado",
      value: 20.0,
    };

    const response = await request(app)
      .put("/addons/1")
      .send(payload)
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockAddon);
    expect(mockExecute).toHaveBeenCalledWith({
      id: 1,
      newData: payload,
    });
  });

  it("should return 400 if input is invalid", async () => {
    const response = await request(app)
      .put("/addons/1")
      .send({ name: "", value: -5 })
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
  });
});
