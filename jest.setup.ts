import "reflect-metadata";
import "./jest/mocks/queueMocks";

import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

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

jest.mock("bcrypt");

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn().mockReturnValue("mocked_token"),
}));
