import { NextFunction, Request, Response } from "express";

import { AppError } from "@shared/errors/AppError";

export function checkRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { user } = req;

    if (!user || !allowedRoles.includes(user.role)) {
      throw new AppError("Acesso negado. Permissão insuficiente.", 403);
    }

    next();
  };
}
