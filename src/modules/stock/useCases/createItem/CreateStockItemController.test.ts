import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppErrorFilter } from "@shared/filters/app-error.filter";
import { UnhandledErrorFilter } from "@shared/filters/unhandled-error.filter";
import { validationExceptionFactory } from "@shared/filters/validation.exception-factory";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { RolesGuard } from "@shared/guards/roles.guard";

import { StockController } from "../../stock.controller";
import { GetStockUseCase } from "../getStock/GetStockUseCase";
import { UpdateStockUseCase } from "../updateStock/UpdateStockUseCase";
import { CreateStockItemUseCase } from "./CreateStockItemUseCase";

describe("CreateStockItemController", () => {
  let nestApplication: INestApplication;
  const mockExecute = jest.fn();
  const mockCreateStockItemUseCase = { execute: mockExecute };

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [StockController],
      providers: [
        {
          provide: CreateStockItemUseCase,
          useValue: mockCreateStockItemUseCase,
        },
        { provide: GetStockUseCase, useValue: { execute: jest.fn() } },
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

  it("should create a stock item and return 201", async () => {
    mockExecute.mockResolvedValue(undefined);

    const payload = {
      name: "Gás",
      type: "GAS",
      quantity: 10,
      value: 89.9,
    };

    const response = await request(nestApplication.getHttpServer())
      .post("/stock")
      .send(payload)
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(201);
    expect(response.body).toEqual(payload);
    expect(mockExecute).toHaveBeenCalledWith(payload);
  });

  it("should return 400 if input is invalid", async () => {
    const response = await request(nestApplication.getHttpServer())
      .post("/stock")
      .send({ name: "", quantity: -5, value: "invalid" })
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
  });
});
