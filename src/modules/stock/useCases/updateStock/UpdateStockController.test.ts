import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppError } from "@shared/errors/AppError";
import { AppErrorFilter } from "@shared/filters/app-error.filter";
import { UnhandledErrorFilter } from "@shared/filters/unhandled-error.filter";
import { validationExceptionFactory } from "@shared/filters/validation.exception-factory";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { RolesGuard } from "@shared/guards/roles.guard";

import { StockController } from "../../stock.controller";
import { CreateStockItemUseCase } from "../createItem/CreateStockItemUseCase";
import { GetStockUseCase } from "../getStock/GetStockUseCase";
import { UpdateStockUseCase } from "./UpdateStockUseCase";

describe("UpdateStockController", () => {
  let nestApplication: INestApplication;
  const mockExecute = jest.fn();
  const mockUpdateStockUseCase = { execute: mockExecute };

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [StockController],
      providers: [
        { provide: CreateStockItemUseCase, useValue: { execute: jest.fn() } },
        { provide: GetStockUseCase, useValue: { execute: jest.fn() } },
        { provide: UpdateStockUseCase, useValue: mockUpdateStockUseCase },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

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

  it("should update a stock item successfully", async () => {
    const updatedItem = {
      id: 1,
      name: "Gás",
      quantity: 15,
      value: 10.0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockExecute.mockResolvedValue(updatedItem);

    const response = await request(nestApplication.getHttpServer())
      .put("/stock/1")
      .send({ quantity: 15, value: 10.0 })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(201);
    expect(response.body).toEqual(updatedItem);
  });

  it("should return 400 for invalid data", async () => {
    const response = await request(nestApplication.getHttpServer())
      .put("/stock/1")
      .send({ quantity: -1 })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(400);
  });

  it("should return the correct status code when UseCase throws AppError", async () => {
    mockExecute.mockImplementation(() => {
      throw new AppError({ message: "Item não encontrado", statusCode: 404 });
    });

    const response = await request(nestApplication.getHttpServer())
      .put("/stock/999")
      .send({ quantity: 10 })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Item não encontrado");
  });

  it("should return 500 when UseCase throws unexpected error", async () => {
    mockExecute.mockRejectedValue(new Error("Unexpected error"));

    const response = await request(nestApplication.getHttpServer())
      .put("/stock/1")
      .send({ quantity: 10 })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Erro interno do servidor");
  });
});
