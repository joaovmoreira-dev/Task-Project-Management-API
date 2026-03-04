import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/authBearer";
import { AuthMeController } from "../controllers/auth.me.controller";

export const authRoutes = Router();

authRoutes.post("/login", AuthController.login);
authRoutes.get("/me", authMiddleware, AuthMeController.me);