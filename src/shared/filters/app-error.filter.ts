import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { Response } from "express";

import { AppError } from "@shared/errors/AppError";

@Catch(AppError)
export class AppErrorFilter implements ExceptionFilter {
  catch(appError: AppError, argumentsHost: ArgumentsHost) {
    const httpResponse = argumentsHost.switchToHttp().getResponse<Response>();
    const isDevelopment = process.env.NODE_ENV === "development";

    const responseBody = {
      message: appError.message,
      ...(isDevelopment && {
        code: appError.code,
        context: appError.context,
      }),
    };

    httpResponse.status(appError.statusCode).json(responseBody);
  }
}
