import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type JwtPayload = {
  userId: string;
  role: string;
};

export function verifyAccessToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);

  // jwt.verify pode retornar string em alguns casos (raros)
  if (typeof decoded === "string" || !decoded) {
    throw new Error("Invalid token payload");
  }

  const { userId, role } = decoded as any;

  if (!userId || !role) {
    throw new Error("Missing token fields");
  }

  return { userId, role };
}