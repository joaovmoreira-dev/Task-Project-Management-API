import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppErrors";

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  // Se já foi tratado como AppError, devolve o status e a mensagem
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  // Erro inesperado: log interno, resposta genérica
  console.error("Unhandled error:", err);

  return res.status(500).json({
    message: "Erro interno no servidor.",
  });
}