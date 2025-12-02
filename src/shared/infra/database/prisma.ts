import { Prisma, PrismaClient } from "@prisma/client";

const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";

function getLogLevel(): Prisma.LogLevel[] {
  if (isDevelopment) return ["query", "error", "warn"];
  if (isProduction) return ["error"];
  return [];
}

const QUERY_TIMEOUT = process.env.DATABASE_QUERY_TIMEOUT
  ? parseInt(process.env.DATABASE_QUERY_TIMEOUT, 10)
  : 15000;

export const prisma = new PrismaClient({
  log: getLogLevel(),
  errorFormat: isDevelopment ? "pretty" : "minimal",
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
}).$extends({
  query: {
    async $allOperations({ operation, model, args, query }) {
      const timeout = new Promise((_, reject) => {
        setTimeout(() => {
          reject(
            new Error(
              `Query timeout: ${model}.${operation} demorou mais de ${QUERY_TIMEOUT}ms`
            )
          );
        }, QUERY_TIMEOUT);
      });

      try {
        return await Promise.race([query(args), timeout]);
      } catch (error) {
        console.error(`[Prisma Timeout] ${model}.${operation}:`, error);
        throw error;
      }
    },
  },
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
