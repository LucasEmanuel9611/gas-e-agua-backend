import { Request, Response } from "express";
import { container } from "tsyringe";

import { CreateUserController } from "./CreateUserController";

describe("CreateUserController", () => {
  let createUserController: CreateUserController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
  let sendMock: jest.Mock;

  beforeEach(() => {
    createUserController = new CreateUserController();

    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    sendMock = jest.fn();

    mockResponse = {
      status: statusMock,
      json: jsonMock,
      send: sendMock,
    };

    jest.spyOn(container, "resolve").mockImplementation(() => ({
      execute: jest.fn().mockResolvedValue(undefined),
    }));
  });

  it("should return 201 and call UseCase when data is valid", async () => {
    mockRequest = {
      body: {
        username: "validUser",
        email: "valid@example.com",
        password: "123456",
        telephone: "11999999999",
        address: {
          street: "Av Teste",
          reference: "Perto do mercado",
          local: "Cidade X",
          number: "123",
        },
      },
    };

    await createUserController.handle(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(statusMock).toHaveBeenCalledWith(201);
    expect(sendMock).toHaveBeenCalledWith({
      username: "validUser",
      email: "valid@example.com",
      password: "123456",
    });
  });

  it("should return 400 with friendly message if required address fields are missing", async () => {
    mockRequest = {
      body: {
        username: "us",
        email: "invalid-email",
        password: "123",
        telephone: "123",
        address: {
          // missing reference and local and street and number
        },
      },
    };

    await createUserController.handle(
      mockRequest as Request,
      mockResponse as Response
    );

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalled();

    const errorResponse = jsonMock.mock.calls[0][0];
    console.log(errorResponse.message);
    expect(errorResponse.message).toContain("É obrigatória uma referência");
    expect(errorResponse.message).toContain("Local é obrigatório");
    expect(errorResponse.message).toContain(
      "O nome de usuário deve ter pelo menos 3 caracteres"
    );
    expect(errorResponse.message).toContain("O e-mail fornecido é inválido");
    expect(errorResponse.message).toContain(
      "A senha deve ter pelo menos 6 dígitos"
    );
    expect(errorResponse.message).toContain(
      "O número de telefone deve ter exatamente 11 dígitos"
    );
  });
});
