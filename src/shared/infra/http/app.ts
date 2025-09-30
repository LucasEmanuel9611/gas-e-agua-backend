import cors from "cors";
import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import "express-async-errors";
import morgan from "morgan";
import "reflect-metadata";
import swaggerUi from "swagger-ui-express";

import { AppError } from "@shared/errors/AppError";

import swaggerFile from "../../../../swagger.json";
import "../../containers/index";
import { LoggerService } from "../../services/LoggerService";
import { metricsService } from "../../services/MetricsService";
import { loggingMiddleware } from "./middlewares/loggingMiddleware";
import { metricsMiddleware } from "./middlewares/metricsMiddleware";
import rateLimiter from "./middlewares/rateLimiter";
import { router } from "./routes";

const app = express();

app.use(metricsMiddleware);
app.use(loggingMiddleware);

app.use(morgan("combined"));

app.get("/metrics", async (req: Request, res: Response) => {
  res.set("Content-Type", "text/plain");
  const metrics = await metricsService.getMetrics();
  res.send(metrics);
});

app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerFile));
const port = process.env.PORT || 3333;

if (process.env.NODE_ENV !== "test") {
  app.use(rateLimiter);
}

app.use(express.json());
app.use(cors());

app.use(router);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
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
        method: req.method,
        url: req.originalUrl,
        userId: req.user?.id,
        userAgent: req.get("User-Agent"),
        ip: req.ip,
        body: req.body,
        params: req.params,
        query: req.query,
        timestamp: new Date().toISOString(),
      }
    );

    // Marcar que AppError foi logado para evitar log duplicado
    res.locals.appErrorLogged = true;

    return res.status(err.statusCode).json({
      message: err.message,
      ...(process.env.NODE_ENV === "development" && {
        context: err.context,
        code: err.code,
      }),
    });
  }

  LoggerService.error(`Internal Server Error: ${err.message}`, err, {
    type: "internal_server_error",
    method: req.method,
    url: req.originalUrl,
    userId: req.user?.id,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
    body: req.body,
    params: req.params,
    query: req.query,
    headers: req.headers,
  });

  return res.status(500).json({
    status: "error",
    message: `Internal Server Error - ${err.message}`,
  });
});

export { app, port };
