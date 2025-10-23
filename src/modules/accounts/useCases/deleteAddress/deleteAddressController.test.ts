import { Request, Response } from "express";
import { container } from "tsyringe";

import { DeleteAddressController } from "./deleteAddressController";

describe("DeleteAddressController", () => {
  let deleteAddressController: DeleteAddressController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let sendMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    deleteAddressController = new DeleteAddressController();

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

  it("should delete address successfully and return 204", async () => {
    jest.spyOn(container, "resolve").mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue(undefined),
    }));

    mockRequest = {
      user: { id: "123", role: "USER" },
      params: { addressId: "456" },
    };

    await deleteAddressController.handle(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(statusMock).toHaveBeenCalledWith(204);
    expect(sendMock).toHaveBeenCalledWith();
  });

  it("should return 500 if useCase throws an error", async () => {
    jest.spyOn(container, "resolve").mockImplementation(() => ({
      execute: jest.fn().mockRejectedValue(new Error("Internal server error")),
    }));

    mockRequest = {
      user: { id: "123", role: "USER" },
      params: { addressId: "456" },
    };

    await deleteAddressController.handle(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Erro interno do servidor",
      unexpectedErrorMsg: "Internal server error",
    });
  });
});
