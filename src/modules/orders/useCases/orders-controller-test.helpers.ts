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

import { AdminForAllScopeGuard } from "../guards/admin-for-all-scope.guard";
import { OrdersController } from "../orders.controller";
import { UsersOrdersController } from "../users-orders.controller";
import { ConcludeOrderUseCase } from "./concludeOrder/ConcludeOrderUseCase";
import { CreateOrderUseCase } from "./createOrder/CreateOrderUseCase";
import { DeleteOrderUseCase } from "./deleteOrder/DeleteOrderUseCase";
import { EditOrderUseCase } from "./editOrderUseCase/EditOrderUseCase";
import { GetAdminHomeDashboardUseCase } from "./getAdminHomeDashboard/GetAdminHomeDashboardUseCase";
import { GetDeliveryDaySummaryUseCase } from "./getDeliveryDaySummary/GetDeliveryDaySummaryUseCase";
import { GetOrderByIdUseCase } from "./getOrderById/GetOrderByIdUseCase";
import { ListOrdersUseCase } from "./listOrders/ListOrdersUseCase";
import { ListUserOrdersUseCase } from "./listUserOrders/ListUserOrdersUseCase";
import { ListUserTransactionsUseCase } from "./listUserTransactions/ListUserTransactionsUseCase";
import { UpdatePaymentStateUseCase } from "./updatePaymentState/UpdatePaymentStateUseCase";

export type OrdersControllerTestAuthenticatedUser = {
  id: string;
  role: string;
};

export type OrdersControllerTestMocks = {
  createOrderUseCase: { execute: jest.Mock };
  editOrderUseCase: { execute: jest.Mock };
  deleteOrderUseCase: { execute: jest.Mock };
  listOrdersUseCase: { execute: jest.Mock; executeAll: jest.Mock };
  getAdminHomeDashboardUseCase: { execute: jest.Mock };
  getDeliveryDaySummaryUseCase: { execute: jest.Mock };
  getOrderByIdUseCase: { execute: jest.Mock };
  concludeOrderUseCase: { execute: jest.Mock };
  updatePaymentStateUseCase: { execute: jest.Mock };
  listUserOrdersUseCase: { execute: jest.Mock };
  listUserTransactionsUseCase: { execute: jest.Mock };
  expoPushService: { sendPushToAdmins: jest.Mock };
};

export async function createOrdersControllerTestingApp(options?: {
  authenticatedUser?: OrdersControllerTestAuthenticatedUser;
}): Promise<{
  nestApplication: INestApplication;
  mocks: OrdersControllerTestMocks;
  authenticatedUser: OrdersControllerTestAuthenticatedUser;
}> {
  const authenticatedUser = options?.authenticatedUser ?? {
    id: "5",
    role: "USER",
  };

  const mocks: OrdersControllerTestMocks = {
    createOrderUseCase: { execute: jest.fn() },
    editOrderUseCase: { execute: jest.fn() },
    deleteOrderUseCase: { execute: jest.fn() },
    listOrdersUseCase: { execute: jest.fn(), executeAll: jest.fn() },
    getAdminHomeDashboardUseCase: { execute: jest.fn() },
    getDeliveryDaySummaryUseCase: { execute: jest.fn() },
    getOrderByIdUseCase: { execute: jest.fn() },
    concludeOrderUseCase: { execute: jest.fn() },
    updatePaymentStateUseCase: { execute: jest.fn() },
    listUserOrdersUseCase: { execute: jest.fn() },
    listUserTransactionsUseCase: { execute: jest.fn() },
    expoPushService: {
      sendPushToAdmins: jest.fn().mockResolvedValue({
        success: true,
        sent: 1,
        failed: 0,
        total: 1,
        errors: [],
      }),
    },
  };

  const testingModule = await Test.createTestingModule({
    controllers: [OrdersController, UsersOrdersController],
    providers: [
      { provide: CreateOrderUseCase, useValue: mocks.createOrderUseCase },
      { provide: EditOrderUseCase, useValue: mocks.editOrderUseCase },
      { provide: DeleteOrderUseCase, useValue: mocks.deleteOrderUseCase },
      { provide: ListOrdersUseCase, useValue: mocks.listOrdersUseCase },
      {
        provide: GetAdminHomeDashboardUseCase,
        useValue: mocks.getAdminHomeDashboardUseCase,
      },
      {
        provide: GetDeliveryDaySummaryUseCase,
        useValue: mocks.getDeliveryDaySummaryUseCase,
      },
      { provide: GetOrderByIdUseCase, useValue: mocks.getOrderByIdUseCase },
      { provide: ConcludeOrderUseCase, useValue: mocks.concludeOrderUseCase },
      {
        provide: UpdatePaymentStateUseCase,
        useValue: mocks.updatePaymentStateUseCase,
      },
      {
        provide: ListUserOrdersUseCase,
        useValue: mocks.listUserOrdersUseCase,
      },
      {
        provide: ListUserTransactionsUseCase,
        useValue: mocks.listUserTransactionsUseCase,
      },
      { provide: ExpoPushService, useValue: mocks.expoPushService },
    ],
  })
    .overrideGuard(JwtAuthGuard)
    .useValue({
      canActivate: (executionContext: ExecutionContext) => {
        const request = executionContext.switchToHttp().getRequest();
        request.user = {
          id: authenticatedUser.id,
          role: authenticatedUser.role,
        };
        return true;
      },
    })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(AdminForAllScopeGuard)
    .useValue({ canActivate: () => true })
    .compile();

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

  return { nestApplication, mocks, authenticatedUser };
}
