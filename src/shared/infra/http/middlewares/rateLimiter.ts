import { NextFunction, Request, Response } from "express";
import { RateLimiterRedis } from "rate-limiter-flexible";
import * as redis from "redis";

import { AppError } from "@shared/errors/AppError";

let redisClient: redis.RedisClientType | null = null;
let limiter: RateLimiterRedis | null = null;

async function getRedisClient() {
  if (!redisClient) {
    redisClient = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    });

    redisClient.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    await redisClient.connect();
  }
  return redisClient;
}

async function getLimiter() {
  if (!limiter) {
    const client = await getRedisClient();
    limiter = new RateLimiterRedis({
      storeClient: client,
      keyPrefix: "rateLimiter",
      points: 15,
      duration: 5,
    });
  }
  return limiter;
}

export default async function rateLimiter(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  if (process.env.NODE_ENV === "test") {
    return next();
  }

  try {
    const rateLimiter = await getLimiter();
    await rateLimiter.consume(request.ip || "unknown");
    return next();
  } catch (err: any) {
    if (err.message === "Too Many Requests") {
      throw new AppError(
        "Muitas requisições. Tente novamente em alguns segundos.",
        429
      );
    }
    throw new AppError("Erro interno do servidor", 500);
  }
}

export async function closeRedisConnection() {
  if (redisClient) {
    await redisClient.disconnect();
    redisClient = null;
    limiter = null;
  }
}
