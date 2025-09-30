import { NextFunction, Request, Response } from "express";

import { LoggerService } from "../../../services/LoggerService";

export function loggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = Date.now();

  res.on("finish", () => {
    const responseTime = Date.now() - start;
    const userId = req.user?.id || undefined;

    // Log HTTP básico sempre
    LoggerService.http(`${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      responseTime,
      userId,
    });

    // Para erros 4xx e 5xx, log apenas se não foi um AppError (que já foi logado)
    if (res.statusCode >= 400 && !res.locals.appErrorLogged) {
      LoggerService.error(`HTTP Error ${res.statusCode}`, undefined, {
        type: "http_error",
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        responseTime,
        userId,
        userAgent: req.get("User-Agent"),
        ip: req.ip,
        body: req.body,
        params: req.params,
        query: req.query,
      });
    }
  });

  next();
}
