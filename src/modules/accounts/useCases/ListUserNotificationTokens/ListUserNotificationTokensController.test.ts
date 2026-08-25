import { INestApplication } from "@nestjs/common";
import request from "supertest";

import { createUsersControllerTestingApp } from "../users-controller-test.helpers";

describe("ListUserNotificationController", () => {
  let nestApplication: INestApplication;
  let mockExecute: jest.Mock;

  beforeAll(async () => {
    const testingApp = await createUsersControllerTestingApp({ userId: "1" });
    nestApplication = testingApp.nestApplication;
    mockExecute = testingApp.mocks.listUserNotificationTokensUseCase.execute;
  });

  afterAll(async () => {
    await nestApplication.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should list user notification tokens successfully", async () => {
    const mockTokens = [
      { id: 1, token: "ExponentPushToken[test123]", user_id: 1 },
      { id: 2, token: "ExponentPushToken[test456]", user_id: 1 },
    ];

    mockExecute.mockResolvedValue(mockTokens);

    const response = await request(nestApplication.getHttpServer())
      .get("/users/notifications/token/list")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockTokens);
  });

  it("should handle empty token list", async () => {
    const mockTokens: unknown[] = [];

    mockExecute.mockResolvedValue(mockTokens);

    const response = await request(nestApplication.getHttpServer())
      .get("/users/notifications/token/list")
      .set("Authorization", "Bearer token");

    expect(response.body).toEqual(mockTokens);
  });

  it("should call use case with proper user id conversion", async () => {
    const testingApp = await createUsersControllerTestingApp({
      userId: "123",
    });
    testingApp.mocks.listUserNotificationTokensUseCase.execute.mockResolvedValue(
      []
    );

    await request(testingApp.nestApplication.getHttpServer())
      .get("/users/notifications/token/list")
      .set("Authorization", "Bearer token");

    expect(
      testingApp.mocks.listUserNotificationTokensUseCase.execute
    ).toHaveBeenCalledWith(123);

    await testingApp.nestApplication.close();
  });

  it("should handle different user id formats", async () => {
    const testingApp = await createUsersControllerTestingApp({
      userId: "456",
    });
    testingApp.mocks.listUserNotificationTokensUseCase.execute.mockResolvedValue(
      []
    );

    const response = await request(testingApp.nestApplication.getHttpServer())
      .get("/users/notifications/token/list")
      .set("Authorization", "Bearer token");

    expect(
      testingApp.mocks.listUserNotificationTokensUseCase.execute
    ).toHaveBeenCalledWith(456);
    expect(response.body).toEqual([]);

    await testingApp.nestApplication.close();
  });

  it("should handle use case errors properly", async () => {
    mockExecute.mockRejectedValue(new Error("Database error"));

    const response = await request(nestApplication.getHttpServer())
      .get("/users/notifications/token/list")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(500);
  });
});
