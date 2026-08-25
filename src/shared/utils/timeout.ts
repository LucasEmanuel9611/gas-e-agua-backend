import { AppError } from "@shared/errors/AppError";

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
  }
}

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operation?: string
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      const message = operation
        ? `Timeout: ${operation} demorou mais de ${timeoutMs}ms`
        : `Operação demorou mais de ${timeoutMs}ms`;

      reject(new TimeoutError(message));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } catch (error) {
    if (error instanceof TimeoutError) {
      throw new AppError({
        message: error.message,
        statusCode: 408,
        code: "OPERATION_TIMEOUT",
      });
    }
    throw error;
  }
}

export function createAbortController(timeoutMs: number): {
  signal: AbortSignal;
  cleanup: () => void;
} {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    cleanup: () => clearTimeout(timeoutId),
  };
}
