interface IAppErrorOptions {
  message: string;
  statusCode?: number;
  context?: Record<string, unknown>;
  code?: string;
}

export class AppError extends Error {
  public readonly message: string;
  public readonly statusCode: number;
  public readonly context?: Record<string, unknown>;
  public readonly code?: string;

  constructor(options: IAppErrorOptions) {
    super(options.message);
    this.message = options.message;
    this.statusCode = options.statusCode ?? 400;
    this.context = options.context;
    this.code = options.code;
    this.name = "AppError";

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}
