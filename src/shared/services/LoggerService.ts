import path from "path";
import winston from "winston";

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(
    ({
      timestamp,
      level,
      message,
      service,
      method,
      url,
      status,
      responseTime,
      userId,
      error,
      ...meta
    }) => {
      const logEntry = {
        timestamp,
        level,
        message,
        service: service || "gas-e-agua-backend",
        method,
        url,
        status,
        responseTime,
        userId,
        error,
        ...meta,
      };

      // Remove propriedades undefined/null para logs mais limpos
      Object.keys(logEntry).forEach((key) => {
        if (logEntry[key] === undefined || logEntry[key] === null) {
          delete logEntry[key];
        }
      });

      return JSON.stringify(logEntry, null, 0);
    }
  )
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  defaultMeta: { service: "gas-e-agua-backend" },
  transports: [
    new winston.transports.File({
      filename: path.join(process.cwd(), "logs", "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(process.cwd(), "logs", "combined.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

export class LoggerService {
  static info(message: string, meta?: Record<string, unknown>): void {
    logger.info(message, meta);
  }

  static error(
    message: string,
    error?: Error,
    meta?: Record<string, unknown>
  ): void {
    logger.error(message, {
      error: error?.stack || error,
      errorMessage: error?.message,
      errorName: error?.name,
      ...meta,
    });
  }

  static warn(message: string, meta?: Record<string, unknown>): void {
    logger.warn(message, meta);
  }

  static debug(message: string, meta?: Record<string, unknown>): void {
    logger.debug(message, meta);
  }

  static controller(
    controller: string,
    action: string,
    message: string,
    meta?: Record<string, unknown>
  ): void {
    logger.info(message, {
      type: "controller",
      controller,
      action,
      ...meta,
    });
  }

  static useCase(
    useCase: string,
    action: string,
    message: string,
    meta?: Record<string, unknown>
  ): void {
    logger.info(message, {
      type: "useCase",
      useCase,
      action,
      ...meta,
    });
  }

  static business(message: string, meta?: Record<string, unknown>): void {
    logger.info(message, {
      type: "business",
      ...meta,
    });
  }

  static http(
    message: string,
    meta: {
      method: string;
      url: string;
      status: number;
      responseTime: number;
      userId?: string;
    }
  ): void {
    logger.info(message, {
      level: "http",
      method: meta.method,
      url: meta.url,
      status: meta.status,
      responseTime: meta.responseTime,
      userId: meta.userId,
    });
  }
}

export default logger;
