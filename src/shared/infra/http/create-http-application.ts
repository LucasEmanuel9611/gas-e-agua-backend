import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  ExpressAdapter,
  NestExpressApplication,
} from "@nestjs/platform-express";

import { AppModule } from "../../../app.module";
import { AppErrorFilter } from "../../filters/app-error.filter";
import { UnhandledErrorFilter } from "../../filters/unhandled-error.filter";
import { validationExceptionFactory } from "../../filters/validation.exception-factory";
import { app } from "./app";

export async function createHttpApplication(): Promise<NestExpressApplication> {
  const nestApplication = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(app)
  );

  nestApplication.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: validationExceptionFactory,
    })
  );
  nestApplication.useGlobalFilters(
    new AppErrorFilter(),
    new UnhandledErrorFilter()
  );
  nestApplication.enableShutdownHooks();

  return nestApplication;
}
