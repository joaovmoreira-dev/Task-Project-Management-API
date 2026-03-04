import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

type AuthTokenPayload = JwtPayload & {
  userId: string;
  role?: "ADMIN" | "MANAGER" | "MEMBER";
};

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  // 401: sem token
  if (!header) {
    return res.status(401).json({ message: "Não autenticado" });
  }

  const [scheme, token] = header.split(" ");

  // 401: formato inválido
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Não autenticado" });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // infra
    return res.status(500).json({ message: "Erro interno" });
  }

  try {
    const decoded = jwt.verify(token, secret) as AuthTokenPayload;

    if (!decoded.userId) {
      return res.status(403).json({ message: "Token inválido" });
    }

    req.auth = { userId: decoded.userId, role: decoded.role };
    return next();
  } catch {
    // 403: token inválido/expirado
    return res.status(403).json({ message: "Token inválido ou expirado" });
  }
}