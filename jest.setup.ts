import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import "reflect-metadata";

import { ListOrdersUseCase } from "@modules/orders/useCases/listOrders/ListOrdersUseCase";
import { UpdateStockUseCase } from "@modules/stock/useCases/updateStock/UpdateStockUseCase";

import {
  mockCreateOrderUseCase,
  mockGetStockUseCase,
  mockListAdminUseCase,
  mockListOrdersUseCase,
  mockSendNotificationUseCase,
  mockUpdateStockUseCase,
} from "./jest/mocks/useCaseMocks";
import { ListAdminUserUseCase } from "./src/modules/accounts/useCases/listAdminUser/ListAdminUserUseCase";
import { CreateOrderUseCase } from "./src/modules/orders/useCases/createOrder/CreateOrderUseCase";
import { SendNotificationUseCase } from "./src/modules/orders/useCases/sendNewOrderNotificationAdmin/SendNewOrderNotificationAdminUseCase";
import { GetStockUseCase } from "./src/modules/stock/useCases/getStock/GetStockUseCase";

dotenv.config({ path: ".env.test" });

const prisma = new PrismaClient();

beforeEach(async () => {
  await prisma.notificationToken.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.stock.deleteMany();
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
          return { execute: mockCreateOrderUseCase };
        }
        if (token === SendNotificationUseCase) {
          return { execute: mockSendNotificationUseCase };
        }
        if (token === ListAdminUserUseCase) {
          return { execute: mockListAdminUseCase };
        }
        if (token === GetStockUseCase) {
          return { execute: mockGetStockUseCase };
        }
        if (token === ListOrdersUseCase) {
          return { execute: mockListOrdersUseCase };
        }
        if (token === UpdateStockUseCase) {
          return { execute: mockUpdateStockUseCase };
        }
        return null;
      }),
      registerSingleton: jest.fn(),
    },
  };
});
