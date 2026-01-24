import { SignOptions } from "jsonwebtoken";

export interface IAuthConfig {
  secret_token: string;
  expires_in_token: SignOptions["expiresIn"];
  secret_refresh_token: string;
  expires_in_refresh_token: SignOptions["expiresIn"];
}

function validateRequiredEnvVars(): void {
  const required = ["JWT_SECRET", "JWT_REFRESH_SECRET"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `CRITICAL SECURITY ERROR: Missing required environment variables: ${missing.join(
        ", "
      )}\n` +
        "These secrets MUST be configured before starting the application.\n" +
        "See docs/security/secrets.md for setup instructions."
    );
  }
}

if (process.env.NODE_ENV !== "test") {
  validateRequiredEnvVars();
}

const authConfig = {
  secret_token: process.env.JWT_SECRET!,
  expires_in_token: process.env.JWT_EXPIRES_IN || "15m",
  secret_refresh_token: process.env.JWT_REFRESH_SECRET!,
  expires_in_refresh_token: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
} as IAuthConfig;

export default authConfig;
