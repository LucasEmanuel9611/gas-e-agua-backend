import auth from "@config/auth";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { verify } from "jsonwebtoken";

import { AppError } from "@shared/errors/AppError";

import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

interface IPayload {
  sub: string;
  role: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(executionContext: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      executionContext.getHandler(),
      executionContext.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = executionContext.switchToHttp().getRequest();
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) {
      throw new AppError({ message: "Token missing", statusCode: 401 });
    }

    const [, token] = authorizationHeader.split(" ");

    try {
      const { sub, role } = verify(token, auth.secret_token) as IPayload;

      request.user = {
        id: sub,
        role,
      };

      return true;
    } catch {
      throw new AppError({ message: "Invalid token", statusCode: 401 });
    }
  }
}
