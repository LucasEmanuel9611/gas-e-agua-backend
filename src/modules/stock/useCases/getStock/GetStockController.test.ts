import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppErrorFilter } from "@shared/filters/app-error.filter";
import { UnhandledErrorFilter } from "@shared/filters/unhandled-error.filter";
import { validationExceptionFactory } from "@shared/filters/validation.exception-factory";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { RolesGuard } from "@shared/guards/roles.guard";

import { StockController } from "../../stock.controller";
import { CreateStockItemUseCase } from "../createItem/CreateStockItemUseCase";
import { UpdateStockUseCase } from "../updateStock/UpdateStockUseCase";
import { GetStockUseCase } from "./GetStockUseCase";

describe("GetStockController", () => {
  let nestApplication: INestApplication;
  const mockExecute = jest.fn();
  const mockGetStockUseCase = { execute: mockExecute };

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [StockController],
      providers: [
        { provide: CreateStockItemUseCase, useValue: { execute: jest.fn() } },
        { provide: GetStockUseCase, useValue: mockGetStockUseCase },
        { provide: UpdateStockUseCase, useValue: { execute: jest.fn() } },
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

  it("should return all stock items with status 201", async () => {
    const items = [
      { id: 1, name: "Gás", quantity: 10, value: 10.0 },
      { id: 2, name: "Água", quantity: 20, value: 5.0 },
    ];

    mockExecute.mockResolvedValue(items);

    const response = await request(nestApplication.getHttpServer())
      .get("/stock")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(201);
    expect(response.body.items).toEqual(items);
  });

  it("should return empty array when no items exist", async () => {
    mockExecute.mockResolvedValue(undefined);

    const response = await request(nestApplication.getHttpServer())
      .get("/stock")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(201);
    expect(response.body.items).toEqual([]);
  });

  it("should return 500 when UseCase throws an error", async () => {
    mockExecute.mockRejectedValue(new Error("Unexpected"));

    const response = await request(nestApplication.getHttpServer())
      .get("/stock")
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Erro interno do servidor");
  });
});
