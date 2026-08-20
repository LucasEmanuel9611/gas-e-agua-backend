import { Request, Response } from "express";
import { container } from "tsyringe";

import { SendNewOrderNotificationAdminController } from "./SendNewOrderNotificationAdminController";

describe("SendNewOrderNotificationAdminController", () => {
  let sendNotificationController: SendNewOrderNotificationAdminController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    sendNotificationController = new SendNewOrderNotificationAdminController();

    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    jest.clearAllMocks();
  });

  it("should send notification successfully and return 200", async () => {
    jest.spyOn(container, "resolve").mockImplementation((token: any) => {
      if (token.name === "ExpoPushService") {
        return {
          sendPushToAdmins: jest.fn().mockResolvedValue({
            success: true,
            sent: 2,
            failed: 0,
            total: 2,
            errors: [],
          }),
        };
      }
      return null;
    });

    mockRequest = {
      body: {
        title: "Test Notification",
        message: "This is a test message",
      },
    };

    await sendNotificationController.handle(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalled();
  });

  it("should return 400 if title is missing", async () => {
    mockRequest = {
      body: {
        message: "This is a test message",
      },
    };

    await sendNotificationController.handle(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("título da notificação é obrigatório"),
      })
    );
  });

  it("should return 400 if message is missing", async () => {
    mockRequest = {
      body: {
        title: "Test Notification",
      },
    };

    await sendNotificationController.handle(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining(
          "mensagem da notificação é obrigatória"
        ),
      })
    );
  });

  it("should return 400 if title is too long", async () => {
    mockRequest = {
      body: {
        title: "a".repeat(101), // exceeds 100 character limit
        message: "This is a test message",
      },
    };

    await sendNotificationController.handle(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("máximo 100 caracteres"),
      })
    );
  });

  it("should handle notification error gracefully", async () => {
    jest.spyOn(container, "resolve").mockImplementation((token: any) => {
      if (token.name === "ExpoPushService") {
        return {
          sendPushToAdmins: jest
            .fn()
            .mockRejectedValue(new Error("Notification failed")),
        };
      }
      return null;
    });

    mockRequest = {
      body: {
        title: "Test Notification",
        message: "This is a test message",
      },
    };

    await sendNotificationController.handle(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(statusMock).toHaveBeenCalledWith(500);
  });

  it("should return 400 with empty tokens array", async () => {
    jest.spyOn(container, "resolve").mockImplementation((token: any) => {
      if (token.name === "ExpoPushService") {
        return {
          sendPushToAdmins: jest.fn().mockResolvedValue({
            success: false,
            sent: 0,
            failed: 0,
            total: 0,
            errors: ["No valid tokens"],
          }),
        };
      }
      return null;
    });

    mockRequest = {
      body: {
        title: "Test Notification",
        message: "This is a test message",
      },
    };

    await sendNotificationController.handle(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: "No valid tokens found" });
  });
});
