import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppErrorFilter } from "@shared/filters/app-error.filter";
import { UnhandledErrorFilter } from "@shared/filters/unhandled-error.filter";
import { validationExceptionFactory } from "@shared/filters/validation.exception-factory";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { RolesGuard } from "@shared/guards/roles.guard";

import { AddonsController } from "../../addons.controller";
import { FindAddonsUseCase } from "../findAddons/FindAddonsUseCase";
import { UpdateAddonUseCase } from "../updateAddon/UpdateAddonUseCase";
import { CreateAddonUseCase } from "./CreateAddonUseCase";

describe("CreateAddonController", () => {
  let nestApplication: INestApplication;
  const mockExecute = jest.fn();
  const mockCreateAddonUseCase = { execute: mockExecute };

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [AddonsController],
      providers: [
        {
          provide: CreateAddonUseCase,
          useValue: mockCreateAddonUseCase,
        },
        { provide: FindAddonsUseCase, useValue: { execute: jest.fn() } },
        { provide: UpdateAddonUseCase, useValue: { execute: jest.fn() } },
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

  it("should create an addon and return 201", async () => {
    const mockAddon = {
      id: 1,
      name: "Botijão para Água",
      type: "WATER_VESSEL",
      value: 15.0,
    };

    mockExecute.mockResolvedValue(mockAddon);

    const payload = {
      name: "Botijão para Água",
      type: "WATER_VESSEL",
      value: 15.0,
    };

    const response = await request(nestApplication.getHttpServer())
      .post("/addons")
      .send(payload)
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockAddon);
    expect(mockExecute).toHaveBeenCalledWith(payload);
  });

  it("should return 400 if input is invalid", async () => {
    const response = await request(nestApplication.getHttpServer())
      .post("/addons")
      .send({ name: "", value: -5 })
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
  });
});
