import fastRedact from "fast-redact";

const SENSITIVE_PATHS = [
  "password",
  "senha",
  "newPassword",
  "oldPassword",
  "currentPassword",
  "token",
  "refreshToken",
  "access_token",
  "refresh_token",
  "jwt",
  "apiKey",
  "api_key",
  "secret",
  "authorization",
  "creditCard",
  "cardNumber",
  "cvv",
  "cvc",
  "cpf",
  "cnpj",
  "ssn",
  "pin",
  "privateKey",
  "private_key",
  "body.password",
  "body.senha",
  "body.token",
  "body.refreshToken",
  "body.creditCard",
  "body.cardNumber",
  "body.cvv",
  "body.cpf",
  "body.cnpj",
  "params.token",
  "params.refreshToken",
  "query.token",
  "query.apiKey",
  "query.api_key",
  "headers.authorization",
  "headers.cookie",
  '["headers"]["x-api-key"]',
  '["headers"]["x-access-token"]',
  '["headers"]["x-refresh-token"]',
];

const SENSITIVE_HEADER_KEYS = ["authorization", "cookie"];

const redactBody = fastRedact({
  paths: SENSITIVE_PATHS,
  censor: "***REDACTED***",
  remove: false,
  serialize: false,
});

const redactHeaders = fastRedact({
  paths: SENSITIVE_HEADER_KEYS,
  censor: "***REDACTED***",
  remove: false,
  serialize: false,
});

const HYPHENATED_HEADERS = [
  "x-api-key",
  "x-access-token",
  "x-refresh-token",
  "set-cookie",
];

function redactHyphenatedHeaders(
  headers: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...headers };
  HYPHENATED_HEADERS.forEach((key) => {
    if (key in result) {
      result[key] = "***REDACTED***";
    }
  });
  return result;
}

export function sanitizeForLog(
  data: Record<string, unknown>
): Record<string, unknown> {
  const clonedData = JSON.parse(JSON.stringify(data));

  if (clonedData.headers && typeof clonedData.headers === "object") {
    clonedData.headers = redactHyphenatedHeaders(
      redactHeaders(clonedData.headers) as Record<string, unknown>
    );
  }

  return redactBody(clonedData);
}

export function redactSensitiveData(obj: unknown): unknown {
  if (!obj || typeof obj !== "object") {
    return obj;
  }

  const clonedObj = JSON.parse(JSON.stringify(obj));
  return redactBody(clonedObj);
}
