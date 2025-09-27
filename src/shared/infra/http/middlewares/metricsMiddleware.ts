import { NextFunction, Request, Response } from "express";

import { metricsService } from "../../../services/MetricsService";

export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = Date.now();

  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;

    metricsService.recordHttpRequest(
      req.method,
      route,
      res.statusCode,
      duration
    );
  });

  next();
}
