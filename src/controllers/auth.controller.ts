import type { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export const AuthController = {
    async login(req: Request, res: Response) {
        const { email, password } = req.body ?? {};

        if (typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({ message: "Payload inválido" });
        }
        if (!email.trim() || !password) {
            return res.status(400).json({ message: "Payload inválido" });
        }

        const result = await AuthService.login({ email, password });

        if (!result.ok) {
            return res.status(result.status).json({ message: result.message });
        }

        return res.status(200).json(result.data);
    }
};