import { Request, Response } from "express";
import { container } from "tsyringe";

import { AppError } from "@shared/errors/AppError";

import { CreateAddressController } from "./createAddressController";

describe("CreateAddressController", () => {
  let createAddressController: CreateAddressController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    createAddressController = new CreateAddressController();

    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn().mockReturnValue({} as Response);

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    jest.clearAllMocks();
  });

  it("should create address successfully and return 201", async () => {
    const mockCreatedAddress = {
      id: 1,
      street: "Rua Teste",
      number: "123",
      reference: "Próximo ao shopping",
      local: "São Paulo",
      user_id: 123,
      isDefault: true,
    };

    jest.spyOn(container, "resolve").mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue(mockCreatedAddress),
    }));

    mockRequest = {
      user: { id: "123", role: "USER" },
      body: {
        street: "Rua Teste",
        number: "123",
        reference: "Próximo ao shopping",
        local: "São Paulo",
      },
    };

    await createAddressController.handle(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(statusMock).toHaveBeenCalledWith(201);
    expect(jsonMock).toHaveBeenCalledWith(mockCreatedAddress);
  });

  it("should return 400 if useCase throws an error", async () => {
    const mockError = new AppError({
      message: "Usuário pode ter no máximo 5 endereços",
      statusCode: 400,
    });

    jest.spyOn(container, "resolve").mockImplementation(() => ({
      execute: jest.fn().mockRejectedValue(mockError),
    }));

    mockRequest = {
      user: { id: "123", role: "USER" },
      body: {
        street: "Rua Teste",
        number: "123",
        reference: "Próximo ao shopping",
        local: "São Paulo",
      },
    };

    await createAddressController.handle(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Usuário pode ter no máximo 5 endereços",
    });
  });
});
