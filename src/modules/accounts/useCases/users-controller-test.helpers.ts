import {
  ExecutionContext,
  INestApplication,
  ValidationPipe,
} from "@nestjs/common";
// eslint-disable-next-line import/no-extraneous-dependencies -- helper de teste; @nestjs/testing é devDependency
import { Test } from "@nestjs/testing";

import { ExpoPushService } from "@modules/notifications/services/ExpoPushService";
import { AppErrorFilter } from "@shared/filters/app-error.filter";
import { UnhandledErrorFilter } from "@shared/filters/unhandled-error.filter";
import { validationExceptionFactory } from "@shared/filters/validation.exception-factory";
import { JwtAuthGuard } from "@shared/guards/jwt-auth.guard";
import { RolesGuard } from "@shared/guards/roles.guard";

import { UsersController } from "../users.controller";
import { CreateAddressUseCase } from "./createAddress/createAddressUseCase";
import { CreateUserUseCase } from "./createUser/CreateUserUseCase";
import { DeleteAddressUseCase } from "./deleteAddress/deleteAddressUseCase";
import { GetUserByIdAdminUseCase } from "./getUserByIdAdmin/GetUserByIdAdminUseCase";
import { ListUserNotificationTokensUseCase } from "./ListUserNotificationTokens/ListUserNotificationTokensUseCase";
import { ListUsersUseCase } from "./listUsers/ListUsersUseCase";
import { ProfileUserUseCase } from "./profileUserUseCase/ProfileUserUsecase";
import { RefreshTokenUseCase } from "./refreshToken/RefreshTokenUseCase";
import { UpdateAddressUseCase } from "./updateAddress/updateAddressUseCase";
import { UpdateUserUseCase } from "./updateUser/updateUserUsecase";
import { UpdateUserNotificationTokensUseCase } from "./updateUserNotificationTokens/UpdateUserNotificationTokensUseCase";

export type UsersControllerTestMocks = {
  createUserUseCase: { execute: jest.Mock };
  refreshTokenUseCase: { execute: jest.Mock };
  profileUserUseCase: { execute: jest.Mock };
  updateUserUseCase: { execute: jest.Mock };
  createAddressUseCase: { execute: jest.Mock };
  updateAddressUseCase: { execute: jest.Mock };
  deleteAddressUseCase: { execute: jest.Mock };
  listUsersUseCase: { execute: jest.Mock };
  getUserByIdAdminUseCase: { execute: jest.Mock };
  updateUserNotificationTokensUseCase: { execute: jest.Mock };
  listUserNotificationTokensUseCase: { execute: jest.Mock };
  expoPushService: { sendPushToAdmins: jest.Mock };
};

export async function createUsersControllerTestingApp(options?: {
  userId?: string;
  overrideJwt?: boolean;
}): Promise<{
  nestApplication: INestApplication;
  mocks: UsersControllerTestMocks;
}> {
  const userId = options?.userId ?? "123";
  const overrideJwt = options?.overrideJwt ?? true;

  const mocks: UsersControllerTestMocks = {
    createUserUseCase: { execute: jest.fn() },
    refreshTokenUseCase: { execute: jest.fn() },
    profileUserUseCase: { execute: jest.fn() },
    updateUserUseCase: { execute: jest.fn() },
    createAddressUseCase: { execute: jest.fn() },
    updateAddressUseCase: { execute: jest.fn() },
    deleteAddressUseCase: { execute: jest.fn() },
    listUsersUseCase: { execute: jest.fn() },
    getUserByIdAdminUseCase: { execute: jest.fn() },
    updateUserNotificationTokensUseCase: { execute: jest.fn() },
    listUserNotificationTokensUseCase: { execute: jest.fn() },
    expoPushService: { sendPushToAdmins: jest.fn() },
  };

  const testingModuleBuilder = Test.createTestingModule({
    controllers: [UsersController],
    providers: [
      { provide: CreateUserUseCase, useValue: mocks.createUserUseCase },
      { provide: RefreshTokenUseCase, useValue: mocks.refreshTokenUseCase },
      { provide: ProfileUserUseCase, useValue: mocks.profileUserUseCase },
      { provide: UpdateUserUseCase, useValue: mocks.updateUserUseCase },
      { provide: CreateAddressUseCase, useValue: mocks.createAddressUseCase },
      { provide: UpdateAddressUseCase, useValue: mocks.updateAddressUseCase },
      { provide: DeleteAddressUseCase, useValue: mocks.deleteAddressUseCase },
      { provide: ListUsersUseCase, useValue: mocks.listUsersUseCase },
      {
        provide: GetUserByIdAdminUseCase,
        useValue: mocks.getUserByIdAdminUseCase,
      },
      {
        provide: UpdateUserNotificationTokensUseCase,
        useValue: mocks.updateUserNotificationTokensUseCase,
      },
      {
        provide: ListUserNotificationTokensUseCase,
        useValue: mocks.listUserNotificationTokensUseCase,
      },
      { provide: ExpoPushService, useValue: mocks.expoPushService },
    ],
  })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true });

  if (overrideJwt) {
    testingModuleBuilder.overrideGuard(JwtAuthGuard).useValue({
      canActivate: (executionContext: ExecutionContext) => {
        const request = executionContext.switchToHttp().getRequest();
        request.user = { id: userId, role: "USER" };
        return true;
      },
    });
  }

  const testingModule = await testingModuleBuilder.compile();
  const nestApplication = testingModule.createNestApplication();
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

  return { nestApplication, mocks };
}
