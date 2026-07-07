import "reflect-metadata";
import "./jest/mocks/queueMocks";

import { AuthenticateUserUseCase } from "@modules/accounts/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "@modules/accounts/useCases/createUser/CreateUserUseCase";
import { ListUserNotificationTokensUseCase } from "@modules/accounts/useCases/ListUserNotificationTokens/ListUserNotificationTokensUseCase";
import { ListUsersUseCase } from "@modules/accounts/useCases/listUsers/ListUsersUseCase";
import { GetUserByIdAdminUseCase } from "@modules/accounts/useCases/getUserByIdAdmin/GetUserByIdAdminUseCase";
import { ProfileUserUseCase } from "@modules/accounts/useCases/profileUserUseCase/ProfileUserUsecase";
import { UpdateUserNotificationTokensUseCase } from "@modules/accounts/useCases/updateUserNotificationTokens/UpdateUserNotificationTokensUseCase";
import { ListOrdersUseCase } from "@modules/orders/useCases/listOrders/ListOrdersUseCase";
import { ListOrdersByDayUseCase } from "@modules/orders/useCases/listOrdersByDay/ListOrdersByDayUseCase";
import { ListUserTransactionsUseCase } from "@modules/orders/useCases/listUserTransactions/ListUserTransactionsUseCase";
import { ListUserOrdersUseCase } from "@modules/orders/useCases/listUserOrders/ListUserOrdersUseCase";
import { ListOrdersByUserUseCase } from "@modules/orders/useCases/listOrdersByUser/ListOrdersByUserUseCase";
import { UpdateStockUseCase } from "@modules/stock/useCases/updateStock/UpdateStockUseCase";
import { PaymentUseCase } from "@modules/transactions/useCases/payment/PaymentUseCase";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

import {
  mockAuthenticateUserUseCase,
  mockCreateOrderUseCase,
  mockCreateUserUseCase,
  mockEditOrderUseCase,
  mockExpoPushService,
  mockGetStockUseCase,
  mockGetAdminHomeDashboardUseCase,
  mockListAdminUseCase,
  mockListOrdersByDayUseCase,
  mockListOrdersByUserUseCase,
  mockListOrdersUseCase,
  mockListUserNotificationTokensUseCase,
  mockListUsersUseCase,
  mockListUserTransactionsUseCase,
  mockListUserOrdersUseCase,
  mockGetUserByIdAdminUseCase,
  mockPaymentUseCase,
  mockProfileUserUseCase,
  mockSendOrderPaymentNotificationsUseCase,
  mockUpdateStockUseCase,
  mockUpdateUserNotificationTokensUseCase,
} from "./jest/mocks/useCaseMocks";
import { ListAdminUserUseCase } from "./src/modules/accounts/useCases/listAdminUser/ListAdminUserUseCase";
import { ExpoPushService } from "./src/modules/notifications/services/ExpoPushService";
import { SendPaymentDueIn5DaysNotificationsUseCase } from "./src/modules/notifications/useCases/sendPaymentDueIn5DaysNotifications/sendPaymentDueIn5DaysNotificationsUseCase";
import { SendPaymentDueTomorrowNotificationsUseCase } from "./src/modules/notifications/useCases/sendPaymentDueTomorrowNotifications/sendPaymentDueTomorrowNotificationsUseCase";
import { SendPaymentLateNotificationsUseCase } from "./src/modules/notifications/useCases/sendPaymentLateNotifications/sendPaymentLateNotificationsUseCase";
import { CreateOrderUseCase } from "./src/modules/orders/useCases/createOrder/CreateOrderUseCase";
import { EditOrderUseCase } from "./src/modules/orders/useCases/editOrderUseCase/EditOrderUseCase";
import { GetAdminHomeDashboardUseCase } from "./src/modules/orders/useCases/getAdminHomeDashboard/GetAdminHomeDashboardUseCase";
import { GetStockUseCase } from "./src/modules/stock/useCases/getStock/GetStockUseCase";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-minimum-32-characters-long";
process.env.JWT_REFRESH_SECRET =
  "test-jwt-refresh-secret-minimum-32-characters-long";

dotenv.config({ path: ".env.test" });

const TEST_DATABASE_IDENTIFIER = "gas_e_agua_test";

if (
  !process.env.DATABASE_URL ||
  !process.env.DATABASE_URL.includes(TEST_DATABASE_IDENTIFIER)
) {
  throw new Error(
    `Tests must use DATABASE_URL with ${TEST_DATABASE_IDENTIFIER}. Check your .env.test file.`
  );
}

const prisma = new PrismaClient();

beforeEach(async () => {
  await prisma.notificationToken.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.orderAddons.deleteMany();
  await prisma.orderItems.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.addons.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

jest.mock("tsyringe", () => {
  const actual = jest.requireActual("tsyringe");

  return {
    ...actual,
    container: {
      resolve: jest.fn((token: any) => {
        if (token === CreateOrderUseCase) {
          return mockCreateOrderUseCase;
        }

        if (token === ListAdminUserUseCase) {
          return mockListAdminUseCase;
        }
        if (token === GetStockUseCase) {
          return mockGetStockUseCase;
        }
        if (token === ListOrdersUseCase) {
          return mockListOrdersUseCase;
        }
        if (token === ListOrdersByDayUseCase) {
          return mockListOrdersByDayUseCase;
        }
        if (token === ListOrdersByUserUseCase) {
          return mockListOrdersByUserUseCase;
        }
        if (token === ListUserOrdersUseCase) {
          return mockListUserOrdersUseCase;
        }
        if (token === ListUserTransactionsUseCase) {
          return mockListUserTransactionsUseCase;
        }
        if (token === UpdateStockUseCase) {
          return mockUpdateStockUseCase;
        }
        if (token === ProfileUserUseCase) {
          return mockProfileUserUseCase;
        }
        if (token === AuthenticateUserUseCase) {
          return mockAuthenticateUserUseCase;
        }
        if (token === CreateUserUseCase) {
          return mockCreateUserUseCase;
        }
        if (token === PaymentUseCase) {
          return mockPaymentUseCase;
        }
        if (token === EditOrderUseCase) {
          return mockEditOrderUseCase;
        }
        if (token === GetAdminHomeDashboardUseCase) {
          return mockGetAdminHomeDashboardUseCase;
        }
        if (token === SendPaymentDueIn5DaysNotificationsUseCase) {
          return mockSendOrderPaymentNotificationsUseCase;
        }
        if (token === SendPaymentDueTomorrowNotificationsUseCase) {
          return mockSendOrderPaymentNotificationsUseCase;
        }
        if (token === SendPaymentLateNotificationsUseCase) {
          return mockSendOrderPaymentNotificationsUseCase;
        }
        if (token === UpdateUserNotificationTokensUseCase) {
          return { execute: mockUpdateUserNotificationTokensUseCase };
        }
        if (token === ListUserNotificationTokensUseCase) {
          return { execute: mockListUserNotificationTokensUseCase };
        }
        if (token === ListUsersUseCase) {
          return mockListUsersUseCase;
        }
        if (token === GetUserByIdAdminUseCase) {
          return mockGetUserByIdAdminUseCase;
        }
        if (token === ExpoPushService) {
          return mockExpoPushService;
        }
        return null;
      }),
      registerSingleton: jest.fn(),
    },
  };
});

jest.mock("bcrypt");

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("mocked_token"),
}));
