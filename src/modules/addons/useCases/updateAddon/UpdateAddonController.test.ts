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
import { FindAddonsUseCase } from "../findAddons/FindAddonsUseCase";
import { UpdateAddonUseCase } from "./UpdateAddonUseCase";

describe("UpdateAddonController", () => {
  let nestApplication: INestApplication;
  const mockExecute = jest.fn();
  const mockUpdateAddonUseCase = { execute: mockExecute };

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [AddonsController],
      providers: [
        { provide: CreateAddonUseCase, useValue: { execute: jest.fn() } },
        { provide: FindAddonsUseCase, useValue: { execute: jest.fn() } },
        { provide: UpdateAddonUseCase, useValue: mockUpdateAddonUseCase },
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

  it("should update an addon and return 201", async () => {
    const mockAddon = {
      id: 1,
      name: "Botijão para Água Atualizado",
      value: 20.0,
    };

    mockExecute.mockResolvedValue(mockAddon);

    const payload = {
      name: "Botijão para Água Atualizado",
      value: 20.0,
    };

    const response = await request(nestApplication.getHttpServer())
      .put("/addons/1")
      .send(payload)
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(201);
    expect(response.body).toEqual(mockAddon);
    expect(mockExecute).toHaveBeenCalledWith({
      id: 1,
      newData: payload,
    });
  });

  it("should return 400 if input is invalid", async () => {
    const response = await request(nestApplication.getHttpServer())
      .put("/addons/1")
      .send({ name: "", value: -5 })
      .set("Authorization", "Bearer valid-token");

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
  });
});
