import { Request, Response } from "express";
import { container } from "tsyringe";

import { AppError } from "@shared/errors/AppError";

import { UpdateAddressController } from "./updateAddressController";

describe("UpdateAddressController", () => {
  let updateAddressController: UpdateAddressController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    updateAddressController = new UpdateAddressController();

    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn().mockReturnValue({} as Response);

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    jest.clearAllMocks();
  });

  it("should update address successfully and return 200", async () => {
    const mockUpdatedAddress = {
      id: 456,
      street: "Rua Atualizada",
      number: "456",
      reference: "Próximo ao shopping",
      local: "São Paulo",
      user_id: 123,
    };

    jest.spyOn(container, "resolve").mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue(mockUpdatedAddress),
    }));

    mockRequest = {
      user: { id: "123", role: "USER" },
      params: { addressId: "456" },
      body: {
        street: "Rua Atualizada",
        number: "456",
      },
    };

    await updateAddressController.handle(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(mockUpdatedAddress);
  });

  it("should return 404 if address not found", async () => {
    const mockError = new AppError({
      message: "Endereço não encontrado",
      statusCode: 404,
    });

    jest.spyOn(container, "resolve").mockImplementation(() => ({
      execute: jest.fn().mockRejectedValue(mockError),
    }));

    mockRequest = {
      user: { id: "123", role: "USER" },
      params: { addressId: "999" },
      body: {
        street: "Rua Atualizada",
        number: "456",
      },
    };

    await updateAddressController.handle(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Endereço não encontrado",
    });
  });
});
