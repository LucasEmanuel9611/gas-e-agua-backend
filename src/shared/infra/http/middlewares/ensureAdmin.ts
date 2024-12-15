import { UsersRepository } from "@modules/accounts/repositories/implementations/UsersRepository";
import { NextFunction, Request, Response } from "express";

import { AppError } from "@shared/errors/AppError";

// interface IPayload {
//   sub: string;
// }

export async function ensureAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = req.user;

  const usersRepository = new UsersRepository();

  const user = await usersRepository.findById(Number(id));

  if (!user.isAdmin) {
    throw new AppError("User doesn't admin!");
  }

  next();
}
