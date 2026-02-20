import { Request, Response, NextFunction } from "express";

export function logger(req: Request, res: Response, next: NextFunction) {
  const startedAt = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    // Exemplo: [200] GET /health - 3ms
    console.log(`[${res.statusCode}] ${req.method} ${req.originalUrl} - ${durationMs}ms`);
  });

  next();
}