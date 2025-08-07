import { Request, Response } from "express";
import { container } from "tsyringe";

import { UpdateUserNotificationTokensController } from "./UpdateUserNotificationTokensController";

describe("UpdateUserNotificationTokensController", () => {
  let updateUserNotificationTokensController: UpdateUserNotificationTokensController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    updateUserNotificationTokensController =
      new UpdateUserNotificationTokensController();

    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn().mockReturnValue({} as Response);

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    jest.clearAllMocks();
  });

  it("should update notification token successfully and return user data", async () => {
    const mockUser = {
      id: 1,
      token: "ExponentPushToken[test123]",
      user_id: 1,
    };

    jest.spyOn(container, "resolve").mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue(mockUser),
    }));

    mockRequest = {
      user: { id: "1" },
      body: {
        token: "ExponentPushToken[test123]",
      },
    };

    await updateUserNotificationTokensController.handle(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(jsonMock).toHaveBeenCalledWith(mockUser);
  });

  it("should return 400 if token is missing", async () => {
    mockRequest = {
      user: { id: "1" },
      body: {},
    };

    await updateUserNotificationTokensController.handle(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("token de notificação é obrigatório"),
      })
    );
  });

  it("should return 400 if token format is invalid", async () => {
    mockRequest = {
      user: { id: "1" },
      body: {
        token: "invalid-token-format",
      },
    };

    await updateUserNotificationTokensController.handle(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining("token válido do Expo"),
      })
    );
  });

  it("should handle use case execution with proper data types", async () => {
    const mockExecute = jest.fn().mockResolvedValue({
      id: 1,
      token: "ExponentPushToken[test123]",
      user_id: 1,
    });

    jest.spyOn(container, "resolve").mockImplementation(() => ({
      execute: mockExecute,
    }));

    mockRequest = {
      user: { id: "1" },
      body: {
        token: "ExponentPushToken[test123]",
      },
    };

    await updateUserNotificationTokensController.handle(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockExecute).toHaveBeenCalledWith(1, "ExponentPushToken[test123]");
  });

  it("should handle use case errors properly", async () => {
    jest.spyOn(container, "resolve").mockImplementation(() => ({
      execute: jest.fn().mockRejectedValue(new Error("Database error")),
    }));

    mockRequest = {
      user: { id: "1" },
      body: {
        token: "ExponentPushToken[test123]",
      },
    };

    await updateUserNotificationTokensController.handle(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(statusMock).toHaveBeenCalledWith(500);
  });
});
