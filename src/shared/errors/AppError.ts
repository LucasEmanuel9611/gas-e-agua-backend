export class AppError extends Error {
  public readonly message: string;
  public readonly statusCode: number;
  public readonly context?: Record<string, unknown>;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode = 400,
    context?: Record<string, unknown>,
    code?: string
  ) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
    this.context = context;
    this.code = code;
    this.name = "AppError";

    // Capturar stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}
