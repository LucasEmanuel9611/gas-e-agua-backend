import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import "reflect-metadata";

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
