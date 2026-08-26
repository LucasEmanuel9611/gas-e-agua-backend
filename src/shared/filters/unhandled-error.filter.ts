import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { Response } from "express";

import { AppError } from "@shared/errors/AppError";

import { AppErrorFilter } from "./app-error.filter";

@Catch()
export class UnhandledErrorFilter implements ExceptionFilter {
  catch(exception: unknown, argumentsHost: ArgumentsHost) {
    if (exception instanceof AppError) {
      new AppErrorFilter().catch(exception, argumentsHost);
      return;
    }

    const httpResponse = argumentsHost.switchToHttp().getResponse<Response>();

    if (exception instanceof Error) {
      const unexpectedErrorMsg =
        exception.message || "Erro interno do servidor";

      httpResponse.status(500).json({
        message: "Erro interno do servidor",
        unexpectedErrorMsg,
      });
      return;
    }

    httpResponse.status(500).json({ message: "Erro interno do servidor" });
  }
}
