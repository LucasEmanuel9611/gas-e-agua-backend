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
  const id = req?.user?.id;

  if (!id) {
    throw new AppError({ message: "User id doest is undefined" });
  }

  const usersRepository = new UsersRepository();

  const user = await usersRepository.findById(Number(id));

  if (user.role !== "ADMIN") {
    throw new AppError({ message: "User doesn't have admin privileges!" });
  }

  next();
}
