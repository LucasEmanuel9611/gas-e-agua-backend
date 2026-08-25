import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppErrorFilter } from "@shared/filters/app-error.filter";
import { UnhandledErrorFilter } from "@shared/filters/unhandled-error.filter";
import { validationExceptionFactory } from "@shared/filters/validation.exception-factory";

import { AuthController } from "../../auth.controller";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

describe("AuthenticateUserController", () => {
  let nestApplication: INestApplication;
  const mockExecute = jest.fn();

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthenticateUserUseCase,
          useValue: { execute: mockExecute },
        },
      ],
    }).compile();

    nestApplication = testingModule.createNestApplication();
    nestApplication.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        exceptionFactory: validationExceptionFactory,
      })
    );
    nestApplication.useGlobalFilters(
      new AppErrorFilter(),
      new UnhandledErrorFilter()
    );
    await nestApplication.init();
  });

  afterAll(async () => {
    await nestApplication.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should authenticate user and return token", async () => {
    const mockResponse = {
      token: "fake_token",
      user: {
        name: "testUser",
        email: "test@example.com",
        role: "USER",
        id: 123,
        address: {
          street: "Test Street",
          number: "123",
          reference: "Test Reference",
          local: "Test City",
        },
      },
    };

    mockExecute.mockResolvedValue(mockResponse);

    const response = await request(nestApplication.getHttpServer())
      .post("/login")
      .send({
        email: "test@example.com",
        password: "123456",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockResponse);
  });

  it("should return 400 if email is invalid", async () => {
    const response = await request(nestApplication.getHttpServer())
      .post("/login")
      .send({
        email: "invalid-email",
        password: "123456",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("O e-mail fornecido é inválido.");
  });

  it("should return 400 if password is too short", async () => {
    const response = await request(nestApplication.getHttpServer())
      .post("/login")
      .send({
        email: "test@example.com",
        password: "123",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "A senha deve ter pelo menos 6 dígitos."
    );
  });

  it("should return 500 if useCase throws an error", async () => {
    mockExecute.mockRejectedValue(new Error("Erro interno do servidor"));

    const response = await request(nestApplication.getHttpServer())
      .post("/login")
      .send({
        email: "test@example.com",
        password: "123456",
      });

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Erro interno do servidor");
  });
});
