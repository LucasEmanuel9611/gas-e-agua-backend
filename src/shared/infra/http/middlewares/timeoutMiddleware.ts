import { NextFunction, Request, Response } from "express";

import { AppError } from "@shared/errors/AppError";

const DEFAULT_TIMEOUT = 30000;
const TIMEOUT_FROM_ENV = process.env.REQUEST_TIMEOUT
  ? parseInt(process.env.REQUEST_TIMEOUT, 10)
  : DEFAULT_TIMEOUT;

export function timeoutMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const timeout = TIMEOUT_FROM_ENV;

  req.setTimeout(timeout, () => {
    if (!res.headersSent) {
      throw new AppError({
        message: "Request timeout - operação demorou muito para responder",
        statusCode: 408,
        code: "REQUEST_TIMEOUT",
      });
    }
  });

  res.setTimeout(timeout, () => {
    if (!res.headersSent) {
      throw new AppError({
        message: "Response timeout - servidor demorou muito para responder",
        statusCode: 504,
        code: "GATEWAY_TIMEOUT",
      });
    }
  });

  next();
}
