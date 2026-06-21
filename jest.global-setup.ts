import { execSync } from "child_process";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

const TEST_DATABASE_IDENTIFIER = "gas_e_agua_test";

export default async () => {
  const envTestPath = path.resolve(process.cwd(), ".env.test");

  if (!fs.existsSync(envTestPath)) {
    throw new Error(
      "Missing .env.test file. Copy .env.test.example to .env.test before running tests."
    );
  }

  dotenv.config({ path: envTestPath });

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl || !databaseUrl.includes(TEST_DATABASE_IDENTIFIER)) {
    throw new Error(
      `Tests must use DATABASE_URL with ${TEST_DATABASE_IDENTIFIER}. Check your .env.test file.`
    );
  }

  execSync("bash scripts/database/setup-test-db.sh", {
    stdio: "inherit",
    env: process.env,
  });

  console.log("Applying schema to test database...");
  execSync("npx prisma db push --accept-data-loss", {
    stdio: "inherit",
    env: process.env,
  });
};
