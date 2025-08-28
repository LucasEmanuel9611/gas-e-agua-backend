import { NextFunction, Request, Response } from "express";

import { ensureAdmin } from "./ensureAdmin";

export async function ensureAdminForAllScope(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const scope =
    typeof req.query.scope === "string" ? req.query.scope : undefined;
  if (scope && scope.toLowerCase() === "all") {
    return ensureAdmin(req, res, next);
  }
  return next();
}
