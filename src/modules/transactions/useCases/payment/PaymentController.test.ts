import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppErrorFilter } from "@shared/filters/app-error.filter";
import { UnhandledErrorFilter } from "@shared/filters/unhandled-error.filter";
import { validationExceptionFactory } from "@shared/filters/validation.exception-factory";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { RolesGuard } from "@shared/guards/roles.guard";

import { TransactionsController } from "../../transactions.controller";
import { FindTransactionByIdUseCase } from "../findTransactionById/FindTransactionByIdUseCase";
import { FindTransactionsByOrderIdUseCase } from "../findTransactionsByOrderId/FindTransactionsByOrderIdUseCase";
import { PaymentUseCase } from "./PaymentUseCase";

describe("PaymentController", () => {
  let nestApplication: INestApplication;
  const mockExecute = jest.fn();
  const mockPaymentUseCase = { execute: mockExecute };

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        { provide: PaymentUseCase, useValue: mockPaymentUseCase },
        {
          provide: FindTransactionByIdUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: FindTransactionsByOrderIdUseCase,
          useValue: { execute: jest.fn() },
        },
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

  it("should create a payment and return 200", async () => {
    const mockOrder = {
      id: 1,
      user_id: 5,
      gasAmount: 2,
      waterAmount: 3,
      total: 50,
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      status: "PENDENTE",
      payment_state: "PENDENTE",
      interest_allowed: true,
      address: {
        id: 1,
        street: "Test Street",
        number: "123",
        reference: "Test Reference",
        local: "Test City",
      },
      user: {
        username: "testUser",
        telephone: "81999999999",
      },
    };

    mockExecute.mockResolvedValue(mockOrder);

    const response = await request(nestApplication.getHttpServer())
      .post("/transactions")
      .send({
        order_id: 1,
        amount_paid: 25,
        payment_method: "DINHEIRO",
      })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Pagamento registrado com sucesso");
    expect(response.body.order).toEqual(mockOrder);
  });

  it("should return 400 for invalid data", async () => {
    const response = await request(nestApplication.getHttpServer())
      .post("/transactions")
      .send({ amount_paid: -10 })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(400);
  });

  it("should return 500 when PaymentUseCase throws an error", async () => {
    mockExecute.mockImplementation(() => {
      throw new Error("Database error");
    });

    const response = await request(nestApplication.getHttpServer())
      .post("/transactions")
      .send({
        order_id: 1,
        amount_paid: 25,
        payment_method: "DINHEIRO",
      })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Erro interno do servidor");
  });
});
