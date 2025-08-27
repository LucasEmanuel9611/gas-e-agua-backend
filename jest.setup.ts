import "reflect-metadata";

import { AuthenticateUserUseCase } from "@modules/accounts/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "@modules/accounts/useCases/createUser/CreateUserUseCase";
import { ListUserNotificationTokensUseCase } from "@modules/accounts/useCases/ListUserNotificationTokens/ListUserNotificationTokensUseCase";
import { ProfileUserUseCase } from "@modules/accounts/useCases/profileUserUseCase/ProfileUserUsecase";
import { UpdateUserNotificationTokensUseCase } from "@modules/accounts/useCases/updateUserNotificationTokens/UpdateUserNotificationTokensUseCase";
import { ListOrdersUseCase } from "@modules/orders/useCases/listOrders/ListOrdersUseCase";
import { ListOrdersByDayUseCase } from "@modules/orders/useCases/listOrdersByDay/ListOrdersByDayUseCase";
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
  mockGetStockUseCase,
  mockListAdminUseCase,
  mockListOrdersByDayUseCase,
  mockListOrdersByUserUseCase,
  mockListOrdersUseCase,
  mockListUserNotificationTokensUseCase,
  mockPaymentUseCase,
  mockProfileUserUseCase,
  mockSendNotificationUseCase,
  mockUpdateStockUseCase,
  mockUpdateUserNotificationTokensUseCase,
} from "./jest/mocks/useCaseMocks";
import { ListAdminUserUseCase } from "./src/modules/accounts/useCases/listAdminUser/ListAdminUserUseCase";
import { CreateOrderUseCase } from "./src/modules/orders/useCases/createOrder/CreateOrderUseCase";
import { EditOrderUseCase } from "./src/modules/orders/useCases/editOrderUseCase/EditOrderUseCase";
import { SendNotificationUseCase } from "./src/modules/orders/useCases/sendNewOrderNotificationAdmin/SendNewOrderNotificationAdminUseCase";
import { GetStockUseCase } from "./src/modules/stock/useCases/getStock/GetStockUseCase";

dotenv.config({ path: ".env.test" });

const prisma = new PrismaClient();

beforeEach(async () => {
  await prisma.notificationToken.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.orderAddons.deleteMany();
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
        if (token === SendNotificationUseCase) {
          return mockSendNotificationUseCase;
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
        if (token === UpdateUserNotificationTokensUseCase) {
          return { execute: mockUpdateUserNotificationTokensUseCase };
        }
        if (token === ListUserNotificationTokensUseCase) {
          return { execute: mockListUserNotificationTokensUseCase };
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
