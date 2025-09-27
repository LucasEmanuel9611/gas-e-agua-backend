import { Request, Response } from "express";

import { AppError } from "@shared/errors/AppError";
import { LoggerService } from "@shared/services/LoggerService";

export function handleControllerError(
  err: unknown,
  response: Response,
  request?: Request
) {
  if (err instanceof AppError) {
    LoggerService.error(
      `AppError [${err.code || "UNKNOWN"}]: ${err.message}`,
      err,
      {
        type: "application_error",
        errorCode: err.code,
        errorMessage: err.message,
        statusCode: err.statusCode,
        context: err.context,
        method: request?.method,
        url: request?.originalUrl,
        userId: request?.user?.id,
        userAgent: request?.get("User-Agent"),
        ip: request?.ip,
        body: request?.body,
        params: request?.params,
        query: request?.query,
        timestamp: new Date().toISOString(),
      }
    );

    return response.status(err.statusCode).json({ message: err.message });
  }

  if (err instanceof Error) {
    LoggerService.error(`Controller Error: ${err.message}`, err, {
      type: "controller_error",
      method: request?.method,
      url: request?.originalUrl,
      userId: request?.user?.id,
      userAgent: request?.get("User-Agent"),
      ip: request?.ip,
      body: request?.body,
      params: request?.params,
      query: request?.query,
    });

    return response.status(500).json({
      message: "Erro interno do servidor",
      unexpectedErrorMsg: err.message || "Erro interno do servidor",
    });
  }

  LoggerService.error(`Unknown Controller Error: ${String(err)}`, undefined, {
    type: "unknown_error",
    method: request?.method,
    url: request?.originalUrl,
    userId: request?.user?.id,
    error: String(err),
  });

  return response.status(500).json({ message: "Erro interno do servidor" });
}
