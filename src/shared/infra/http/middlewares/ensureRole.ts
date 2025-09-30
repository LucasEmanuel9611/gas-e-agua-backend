import { UsersRepository } from "@modules/accounts/repositories/implementations/UsersRepository";
import { UserRole } from "@modules/accounts/types";
import { NextFunction, Request, Response } from "express";

import { AppError } from "@shared/errors/AppError";

export function ensureRole(allowedRoles: UserRole[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.user;

    const usersRepository = new UsersRepository();

    const user = await usersRepository.findById(Number(id));

    if (!allowedRoles.includes(user.role)) {
      throw new AppError({
        message: `User doesn't have required privileges! Required roles: ${allowedRoles.join(
          ", "
        )}`,
      });
    }

    next();
  };
}
