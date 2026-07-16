import { OrderAccessPolicy } from "@modules/orders/policies/OrderAccessPolicy";
import { NextFunction, Request, Response } from "express";

import { AppError } from "@shared/errors/AppError";

export async function ensureAdminForAllScope(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const scope =
    typeof req.query.scope === "string" ? req.query.scope : undefined;

  if (scope && scope.toLowerCase() === "all") {
    const { user } = req;

    if (!user || !OrderAccessPolicy.canListAllOrders(user.role)) {
      throw new AppError({
        message: "Acesso negado. Permissão insuficiente.",
        statusCode: 403,
      });
    }
  }

  return next();
}
