import { Request, Response, NextFunction } from "express";

export function logger(req: Request, res: Response, next: NextFunction) {
  const startedAt = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    const timestamp = new Date().toISOString();

    const level = res.statusCode >= 500 ? "ERROR"
                : res.statusCode >= 400 ? "WARN"
                : "INFO";
    
    console.log(`[${timestamp}] [${level}] [${res.statusCode}] ${req.method} ${req.originalUrl} - ${durationMs}ms`);
  });

  next();
}