import { Router } from "express";
import { AuthController } from "../auth/auth.controller";
import { authMiddleware } from "../../middlewares/authBearer";
import { AuthMeController } from "../auth/auth.me.controller";
import { loginRateLimiter } from "../../middlewares/rateLimiter";

export const authRoutes = Router();

authRoutes.post("/login", loginRateLimiter, AuthController.login);
authRoutes.post("/register", AuthController.register);
authRoutes.get("/me", authMiddleware, AuthMeController.me);