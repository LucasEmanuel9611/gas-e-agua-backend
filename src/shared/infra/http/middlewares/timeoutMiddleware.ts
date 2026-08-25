import { NextFunction, Request, Response } from "express";

const DEFAULT_TIMEOUT = 30000;
const TIMEOUT_FROM_ENV = process.env.REQUEST_TIMEOUT
  ? parseInt(process.env.REQUEST_TIMEOUT, 10)
  : DEFAULT_TIMEOUT;

function sendTimeoutResponse(
  res: Response,
  statusCode: number,
  message: string,
  code: string
): void {
  if (res.headersSent) return;
  const body: { message: string; code?: string } = { message };
  if (process.env.NODE_ENV === "development") {
    body.code = code;
  }
  res.status(statusCode).json(body);
}

export function timeoutMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const timeout = TIMEOUT_FROM_ENV;

  req.setTimeout(timeout, () => {
    sendTimeoutResponse(
      res,
      408,
      "Request timeout - operação demorou muito para responder",
      "REQUEST_TIMEOUT"
    );
  });

  res.setTimeout(timeout, () => {
    sendTimeoutResponse(
      res,
      504,
      "Response timeout - servidor demorou muito para responder",
      "GATEWAY_TIMEOUT"
    );
  });

  next();
}
