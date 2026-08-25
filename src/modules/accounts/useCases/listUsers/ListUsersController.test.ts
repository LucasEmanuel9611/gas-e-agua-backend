import { INestApplication } from "@nestjs/common";
import request from "supertest";

import { createUsersControllerTestingApp } from "../users-controller-test.helpers";

describe("ListUsersController", () => {
  let nestApplication: INestApplication;
  let unauthorizedApplication: INestApplication;
  let mockExecute: jest.Mock;

  beforeAll(async () => {
    const testingApp = await createUsersControllerTestingApp();
    nestApplication = testingApp.nestApplication;
    mockExecute = testingApp.mocks.listUsersUseCase.execute;

    const unauthorizedTestingApp = await createUsersControllerTestingApp({
      overrideJwt: false,
    });
    unauthorizedApplication = unauthorizedTestingApp.nestApplication;
  });

  afterAll(async () => {
    await nestApplication.close();
    await unauthorizedApplication.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should list users and return 200", async () => {
    const mockResponse = {
      users: [
        {
          id: 1,
          username: "João Silva",
          email: "joao@test.com",
          telephone: "81999999999",
          role: "USER",
          created_at: new Date("2024-01-01").toISOString(),
          addresses: [],
          accountSummary: {
            openBalance: 100,
            openAccountsCount: 1,
            overdueAccountsCount: 0,
          },
        },
      ],
      total: 1,
      page: 1,
      totalPages: 1,
    };

    mockExecute.mockResolvedValue(mockResponse);

    const response = await request(nestApplication.getHttpServer())
      .get("/users/list/1/10")
      .query({ page: 1, limit: 10, search: "João" })
      .set("Authorization", "Bearer token");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockResponse);
    expect(mockExecute).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      search: "João",
      sort: "highest_debt_first",
    });
  });

  it("should return 401 without authorization token", async () => {
    const response = await request(unauthorizedApplication.getHttpServer()).get(
      "/users/list/1/10"
    );

    expect(response.status).toBe(401);
  });
});
