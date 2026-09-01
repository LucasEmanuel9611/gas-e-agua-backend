import { Request, Response } from "express";
import { container } from "tsyringe";

import { DeleteUserNotificationTokenController } from "./DeleteUserNotificationTokenController";

describe("DeleteUserNotificationTokenController", () => {
  let deleteUserNotificationTokenController: DeleteUserNotificationTokenController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let sendMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    deleteUserNotificationTokenController =
      new DeleteUserNotificationTokenController();

    statusMock = jest.fn().mockReturnThis();
    sendMock = jest.fn().mockReturnValue({} as Response);
    jsonMock = jest.fn().mockReturnValue({} as Response);

    mockResponse = {
      status: statusMock,
      send: sendMock,
      json: jsonMock,
    };

    jest.clearAllMocks();
  });

  it("should delete the notification token and return 204", async () => {
    const mockExecute = jest.fn().mockResolvedValue(undefined);

    jest.spyOn(container, "resolve").mockImplementation(() => ({
      execute: mockExecute,
    }));

    mockRequest = {
      user: { id: "1", role: "USER" },
      body: {
        token: "ExponentPushToken[test123]",
      },
    };

    await deleteUserNotificationTokenController.handle(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockExecute).toHaveBeenCalledWith(1, "ExponentPushToken[test123]");
    expect(statusMock).toHaveBeenCalledWith(204);
    expect(sendMock).toHaveBeenCalledWith();
  });

  it("should return 400 if token is missing", async () => {
    mockRequest = {
      user: { id: "1", role: "USER" },
      body: {},
    };

    await deleteUserNotificationTokenController.handle(
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
      user: { id: "1", role: "USER" },
      body: {
        token: "invalid-token-format",
      },
    };

    await deleteUserNotificationTokenController.handle(
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

  it("should handle use case errors properly", async () => {
    jest.spyOn(container, "resolve").mockImplementation(() => ({
      execute: jest.fn().mockRejectedValue(new Error("Database error")),
    }));

    mockRequest = {
      user: { id: "1", role: "USER" },
      body: {
        token: "ExponentPushToken[test123]",
      },
    };

    await deleteUserNotificationTokenController.handle(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(statusMock).toHaveBeenCalledWith(500);
  });
});
