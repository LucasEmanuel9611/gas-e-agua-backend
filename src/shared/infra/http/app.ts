import cors from "cors";

import "dotenv/config";
import "express-async-errors";
import "reflect-metadata";

import express, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import { AppError } from "@shared/errors/AppError";
import "../../containers/index";

import swaggerFile from "../../../../swagger.json";
import rateLimiter from "./middlewares/rateLimiter";
import { router } from "./routes";

const app = express();

app.use(morgan("combined"));

app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerFile));
const port = 3333;

if (process.env.NODE_ENV !== "test") {
  app.use(rateLimiter);
}

app.use(express.json());
app.use(cors());

app.use(router);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  return res.status(500).json({
    status: "error",
    message: `Internal Server Error - ${err.message}`,
  });
});

export { app, port };
