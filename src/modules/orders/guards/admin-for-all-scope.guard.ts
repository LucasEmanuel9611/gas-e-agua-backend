import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

import { OrderAccessPolicy } from "@modules/orders/policies/OrderAccessPolicy";
import { AppError } from "@shared/errors/AppError";

@Injectable()
export class AdminForAllScopeGuard implements CanActivate {
  canActivate(executionContext: ExecutionContext): boolean {
    const request = executionContext.switchToHttp().getRequest();
    const scope =
      typeof request.query.scope === "string" ? request.query.scope : undefined;

    if (scope && scope.toLowerCase() === "all") {
      const { user } = request;

      if (!user || !OrderAccessPolicy.canListAllOrders(user.role)) {
        throw new AppError({
          message: "Acesso negado. Permissão insuficiente.",
          statusCode: 403,
        });
      }
    }

    return true;
  }
}
