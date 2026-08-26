import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { AppError } from "@shared/errors/AppError";

import { ROLES_METADATA_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(executionContext: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_METADATA_KEY,
      [executionContext.getHandler(), executionContext.getClass()]
    );

    if (!requiredRoles?.length) {
      return true;
    }

    const request = executionContext.switchToHttp().getRequest();
    const userRole = request.user?.role;

    if (!userRole || !requiredRoles.includes(userRole)) {
      throw new AppError({
        message: "Acesso negado. Permissão insuficiente.",
        statusCode: 403,
      });
    }

    return true;
  }
}
