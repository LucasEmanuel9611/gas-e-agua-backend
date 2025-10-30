import { Prisma, PrismaClient } from "@prisma/client";

const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";

function getLogLevel(): Prisma.LogLevel[] {
  if (isDevelopment) return ["query", "error", "warn"];
  if (isProduction) return ["error"];
  return [];
}

export const prisma = new PrismaClient({
  log: getLogLevel(),
  errorFormat: isDevelopment ? "pretty" : "minimal",
});

export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}

async function disconnectPrisma() {
  await prisma.$disconnect();
  console.log("✅ Prisma disconnected gracefully");
}

process.on("beforeExit", async () => {
  await disconnectPrisma();
});

process.on("SIGTERM", async () => {
  await disconnectPrisma();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await disconnectPrisma();
  process.exit(0);
});
