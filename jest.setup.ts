import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import dotenv from "dotenv";
import "reflect-metadata";

dotenv.config({ path: ".env.test" });

execSync("npx prisma db push --accept-data-loss");

const prisma = new PrismaClient();

beforeEach(async () => {
  await prisma.notificationToken.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.stock.deleteMany();
});
