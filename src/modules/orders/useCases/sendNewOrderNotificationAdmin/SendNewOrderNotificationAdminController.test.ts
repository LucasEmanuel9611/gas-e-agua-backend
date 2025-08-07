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
    const mockUser = {
      notificationTokens: [
        { token: "ExponentPushToken[test123]", id: 1, user_id: 1 },
        { token: "ExponentPushToken[test456]", id: 2, user_id: 1 },
      ],
    };

    jest.spyOn(container, "resolve").mockImplementation((token: any) => {
      if (token.name === "SendNotificationUseCase") {
        return { execute: jest.fn().mockResolvedValue(undefined) };
      }
      if (token.name === "ListAdminUserUseCase") {
        return { execute: jest.fn().mockResolvedValue(mockUser) };
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
    const mockUser = {
      notificationTokens: [
        { token: "ExponentPushToken[test123]", id: 1, user_id: 1 },
      ],
    };

    jest.spyOn(container, "resolve").mockImplementation((token: any) => {
      if (token.name === "SendNotificationUseCase") {
        return {
          execute: jest
            .fn()
            .mockRejectedValue(new Error("Notification failed")),
        };
      }
      if (token.name === "ListAdminUserUseCase") {
        return { execute: jest.fn().mockResolvedValue(mockUser) };
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

  it("should send notification with empty tokens array", async () => {
    const mockUser = {
      notificationTokens: [],
    };

    jest.spyOn(container, "resolve").mockImplementation((token: any) => {
      if (token.name === "SendNotificationUseCase") {
        return { execute: jest.fn().mockResolvedValue(undefined) };
      }
      if (token.name === "ListAdminUserUseCase") {
        return { execute: jest.fn().mockResolvedValue(mockUser) };
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
});
