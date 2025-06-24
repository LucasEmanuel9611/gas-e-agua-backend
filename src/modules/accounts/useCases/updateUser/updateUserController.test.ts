import request from "supertest";
import { container } from "tsyringe";

import { app } from "@shared/infra/http/app";

import { UpdateUserController } from "./updateUserController";

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
        req.user = { id: "123" };
        next();
      },
    };
  }
);

describe("UpdateUserController", () => {
  beforeAll(() => {
    const controller = new UpdateUserController();
    app.put("/users/profile", controller.handle.bind(controller));
  });

  it("should return 200 and updated user data when update is successful", async () => {
    const mockUserData = {
      username: "updatedUser",
      email: "updated@example.com",
      address: {
        street: "New Street",
        number: "456",
        reference: "New Reference",
        local: "New City",
      },
    };

    jest.spyOn(container, "resolve").mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue({
        id: 123,
        username: "updatedUser",
        email: "updated@example.com",
        isAdmin: false,
        notificationTokens: [],
      }),
    }));

    const response = await request(app)
      .put("/users/profile")
      .set("Authorization", "Bearer token")
      .send(mockUserData);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 123,
      username: "updatedUser",
      email: "updated@example.com",
      isAdmin: false,
      notificationTokens: [],
    });
  });

  it("should return 500 if useCase throws an error", async () => {
    const mockUserData = {
      username: "updatedUser",
      email: "updated@example.com",
    };

    jest.spyOn(container, "resolve").mockImplementation(() => ({
      execute: jest.fn().mockRejectedValue(new Error("Internal server error")),
    }));

    const response = await request(app)
      .put("/users/profile")
      .set("Authorization", "Bearer token")
      .send(mockUserData);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Erro interno do servidor");
  });
});
