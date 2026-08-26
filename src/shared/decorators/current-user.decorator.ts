import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CurrentUser = createParamDecorator(
  (_data: unknown, executionContext: ExecutionContext) =>
    executionContext.switchToHttp().getRequest().user
);
