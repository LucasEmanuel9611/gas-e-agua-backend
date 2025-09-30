import { Request, Response } from "express";
import { container } from "tsyringe";

import { ListUserNotificationController } from "./ListUserNotificationTokensController";

describe("ListUserNotificationController", () => {
  let listUserNotificationController: ListUserNotificationController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    listUserNotificationController = new ListUserNotificationController();

    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn().mockReturnValue({} as Response);

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    jest.clearAllMocks();
  });

  it("should list user notification tokens successfully", async () => {
    const mockTokens = [
      { id: 1, token: "ExponentPushToken[test123]", user_id: 1 },
      { id: 2, token: "ExponentPushToken[test456]", user_id: 1 },
    ];

    jest.spyOn(container, "resolve").mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue(mockTokens),
    }));

    mockRequest = {
      user: { id: "1", role: "USER" },
    };

    await listUserNotificationController.handle(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(jsonMock).toHaveBeenCalledWith(mockTokens);
  });

  it("should handle empty token list", async () => {
    const mockTokens = [];

    jest.spyOn(container, "resolve").mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue(mockTokens),
    }));

    mockRequest = {
      user: { id: "1", role: "USER" },
    };

    await listUserNotificationController.handle(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(jsonMock).toHaveBeenCalledWith(mockTokens);
  });

  it("should call use case with proper user id conversion", async () => {
    const mockExecute = jest.fn().mockResolvedValue([]);

    jest.spyOn(container, "resolve").mockImplementation(() => ({
      execute: mockExecute,
    }));

    mockRequest = {
      user: { id: "123", role: "USER" },
    };

    await listUserNotificationController.handle(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockExecute).toHaveBeenCalledWith(123);
  });

  it("should handle different user id formats", async () => {
    const mockExecute = jest.fn().mockResolvedValue([]);

    jest.spyOn(container, "resolve").mockImplementation(() => ({
      execute: mockExecute,
    }));

    mockRequest = {
      user: { id: "456", role: "USER" },
    };

    await listUserNotificationController.handle(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(mockExecute).toHaveBeenCalledWith(456);
    expect(jsonMock).toHaveBeenCalled();
  });

  it("should handle use case errors properly", async () => {
    jest.spyOn(container, "resolve").mockImplementation(() => ({
      execute: jest.fn().mockRejectedValue(new Error("Database error")),
    }));

    mockRequest = {
      user: { id: "1", role: "USER" },
    };

    await listUserNotificationController.handle(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(statusMock).toHaveBeenCalledWith(500);
  });
});
