import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

import { AppErrorFilter } from "@shared/filters/app-error.filter";
import { UnhandledErrorFilter } from "@shared/filters/unhandled-error.filter";
import { validationExceptionFactory } from "@shared/filters/validation.exception-factory";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { RolesGuard } from "@shared/guards/roles.guard";

import { AddonsController } from "../../addons.controller";
import { CreateAddonUseCase } from "../createAddon/CreateAddonUseCase";
import { UpdateAddonUseCase } from "../updateAddon/UpdateAddonUseCase";
import { FindAddonsUseCase } from "./FindAddonsUseCase";

describe("FindAddonsController", () => {
  let nestApplication: INestApplication;
  const mockExecute = jest.fn();
  const mockFindAddonsUseCase = { execute: mockExecute };

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [AddonsController],
      providers: [
        { provide: CreateAddonUseCase, useValue: { execute: jest.fn() } },
        { provide: FindAddonsUseCase, useValue: mockFindAddonsUseCase },
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

  it("should return all addons with status 200", async () => {
    const mockAddons = [
      {
        id: 1,
        name: "Botijão para Água",
        value: 15.0,
      },
      {
        id: 2,
        name: "Botijão para Gás",
        value: 25.0,
      },
    ];

    mockExecute.mockResolvedValue(mockAddons);

    const response = await request(nestApplication.getHttpServer())
      .get("/addons")
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockAddons);
    expect(mockExecute).toHaveBeenCalled();
  });
});
