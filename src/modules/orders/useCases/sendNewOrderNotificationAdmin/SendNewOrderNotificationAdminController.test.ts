import { INestApplication } from "@nestjs/common";
import request from "supertest";

import { createUsersControllerTestingApp } from "@modules/accounts/useCases/users-controller-test.helpers";

describe("SendNewOrderNotificationAdminController", () => {
  let nestApplication: INestApplication;
  let sendPushToAdmins: jest.Mock;

  beforeAll(async () => {
    const testingApp = await createUsersControllerTestingApp();
    nestApplication = testingApp.nestApplication;
    sendPushToAdmins = testingApp.mocks.expoPushService.sendPushToAdmins;
  });

  afterAll(async () => {
    await nestApplication.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should send notification successfully and return 200", async () => {
    sendPushToAdmins.mockResolvedValue({
      success: true,
      sent: 2,
      failed: 0,
      total: 2,
      errors: [],
    });

    const response = await request(nestApplication.getHttpServer())
      .post("/users/notifications/send/admin")
      .set("Authorization", "Bearer token")
      .send({
        title: "Test Notification",
        message: "This is a test message",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      sent: 2,
      failed: 0,
      total: 2,
    });
  });

  it("should return 400 if title is missing", async () => {
    const response = await request(nestApplication.getHttpServer())
      .post("/users/notifications/send/admin")
      .set("Authorization", "Bearer token")
      .send({
        message: "This is a test message",
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: expect.stringContaining("título da notificação é obrigatório"),
      })
    );
  });

  it("should return 400 if message is missing", async () => {
    const response = await request(nestApplication.getHttpServer())
      .post("/users/notifications/send/admin")
      .set("Authorization", "Bearer token")
      .send({
        title: "Test Notification",
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: expect.stringContaining(
          "mensagem da notificação é obrigatória"
        ),
      })
    );
  });

  it("should return 400 if title is too long", async () => {
    const response = await request(nestApplication.getHttpServer())
      .post("/users/notifications/send/admin")
      .set("Authorization", "Bearer token")
      .send({
        title: "a".repeat(101),
        message: "This is a test message",
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: expect.stringContaining("máximo 100 caracteres"),
      })
    );
  });

  it("should handle notification error gracefully", async () => {
    sendPushToAdmins.mockRejectedValue(new Error("Notification failed"));

    const response = await request(nestApplication.getHttpServer())
      .post("/users/notifications/send/admin")
      .set("Authorization", "Bearer token")
      .send({
        title: "Test Notification",
        message: "This is a test message",
      });

    expect(response.status).toBe(500);
  });

  it("should return 400 with empty tokens array", async () => {
    sendPushToAdmins.mockResolvedValue({
      success: false,
      sent: 0,
      failed: 0,
      total: 0,
      errors: ["No valid tokens"],
    });

    const response = await request(nestApplication.getHttpServer())
      .post("/users/notifications/send/admin")
      .set("Authorization", "Bearer token")
      .send({
        title: "Test Notification",
        message: "This is a test message",
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "No valid tokens found" });
  });
});
