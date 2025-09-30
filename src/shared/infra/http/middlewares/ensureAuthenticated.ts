import auth from "@config/auth";
import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

import { AppError } from "@shared/errors/AppError";

interface IPayload {
  sub: string;
  role: string;
}

export async function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new AppError({ message: "Token missing", statusCode: 401 });
  }

  const [, token] = authHeader.split(" ");

  try {
    const { sub: user_id, role } = verify(token, auth.secret_token) as IPayload;

    request.user = {
      id: user_id,
      role,
    };

    next();
  } catch (e) {
    throw new AppError({ message: "Invalid token", statusCode: 401 });
  }
}
