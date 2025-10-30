import { NextFunction, Request, Response } from "express";
import { RateLimiterRedis } from "rate-limiter-flexible";
import * as redis from "redis";

import { AppError } from "@shared/errors/AppError";

let redisClient: redis.RedisClientType | null = null;
let rateLimiter: RateLimiterRedis | null = null;

async function initializeRateLimiter(): Promise<void> {
  if (rateLimiter) {
    return;
  }

  redisClient = redis.createClient({
    legacyMode: true,
    socket: {
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
    },
  });

  redisClient.on("error", (err) => {
    console.error("Redis Rate Limiter Error:", err);
  });

  await redisClient.connect();

  rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: "rateLimiter",
    points: 100,
    duration: 60,
    blockDuration: 60,
  });
}

export default async function rateLimiterMiddleware(
  request: Request,
  response: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!rateLimiter) {
      await initializeRateLimiter();
    }

    await rateLimiter!.consume(request.ip);
    return next();
  } catch (err) {
    if (err instanceof Error) {
      throw new AppError({
        message: "Too many requests. Please try again later.",
        statusCode: 429,
      });
    }

    const resetTime = Math.ceil(err.msBeforeNext / 1000);
    response.set("Retry-After", String(resetTime));

    throw new AppError({
      message: `Too many requests. Please try again in ${resetTime} seconds.`,
      statusCode: 429,
      context: { retryAfter: resetTime },
    });
  }
}

process.on("SIGTERM", async () => {
  if (redisClient) {
    await redisClient.disconnect();
  }
});

process.on("SIGINT", async () => {
  if (redisClient) {
    await redisClient.disconnect();
  }
});
