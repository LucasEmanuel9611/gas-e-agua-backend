import { Response } from "express";

import { AppError } from "@shared/errors/AppError";

export function handleControllerError(err: unknown, response: Response) {
  if (err instanceof AppError) {
    console.error("AppError: ", err);
    return response.status(err.statusCode).json({ message: err.message });
  }

  if (err instanceof Error) {
    console.error("Erro padrão:", err);
    return response.status(500).json({
      message: "Erro interno do servidor",
      unexpectedErrorMsg: err.message || "Erro interno do servidor",
    });
  }

  console.error("Erro interno:", err);
  return response.status(500).json({ message: "Erro interno do servidor" });
}
