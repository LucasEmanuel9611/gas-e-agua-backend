import { INestApplication } from "@nestjs/common";
import request from "supertest";

import { createUsersControllerTestingApp } from "../users-controller-test.helpers";

describe("UpdateUserNotificationTokensController", () => {
  let nestApplication: INestApplication;
  let mockExecute: jest.Mock;

  beforeAll(async () => {
    const testingApp = await createUsersControllerTestingApp({ userId: "1" });
    nestApplication = testingApp.nestApplication;
    mockExecute = testingApp.mocks.updateUserNotificationTokensUseCase.execute;
  });

  afterAll(async () => {
    await nestApplication.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update notification token successfully and return user data", async () => {
    const mockUser = {
      id: 1,
      token: "ExponentPushToken[test123]",
      user_id: 1,
    };

    mockExecute.mockResolvedValue(mockUser);

    const response = await request(nestApplication.getHttpServer())
      .post("/users/notifications/token/register/admin")
      .set("Authorization", "Bearer token")
      .send({
        token: "ExponentPushToken[test123]",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockUser);
  });

  it("should return 400 if token is missing", async () => {
    const response = await request(nestApplication.getHttpServer())
      .post("/users/notifications/token/register/admin")
      .set("Authorization", "Bearer token")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: expect.stringContaining("token de notificação é obrigatório"),
      })
    );
  });

  it("should return 400 if token format is invalid", async () => {
    const response = await request(nestApplication.getHttpServer())
      .post("/users/notifications/token/register/admin")
      .set("Authorization", "Bearer token")
      .send({
        token: "invalid-token-format",
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: expect.stringContaining("token válido do Expo"),
      })
    );
  });

  it("should handle use case execution with proper data types", async () => {
    mockExecute.mockResolvedValue({
      id: 1,
      token: "ExponentPushToken[test123]",
      user_id: 1,
    });

    await request(nestApplication.getHttpServer())
      .post("/users/notifications/token/register/admin")
      .set("Authorization", "Bearer token")
      .send({
        token: "ExponentPushToken[test123]",
      });

    expect(mockExecute).toHaveBeenCalledWith(1, "ExponentPushToken[test123]");
  });

  it("should handle use case errors properly", async () => {
    mockExecute.mockRejectedValue(new Error("Database error"));

    const response = await request(nestApplication.getHttpServer())
      .post("/users/notifications/token/register/admin")
      .set("Authorization", "Bearer token")
      .send({
        token: "ExponentPushToken[test123]",
      });

    expect(response.status).toBe(500);
  });
});
