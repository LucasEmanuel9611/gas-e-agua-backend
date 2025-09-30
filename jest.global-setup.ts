import { execSync } from "child_process";
import dotenv from "dotenv";

export default async () => {
  dotenv.config({ path: ".env.test" });

  console.log("Executando prisma db push...");
  execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
};
