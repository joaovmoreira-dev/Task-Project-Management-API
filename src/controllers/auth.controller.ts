import type { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

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
    },

    async register(req: Request, res: Response) {

        const { name, email, password} = req.body ?? {};

        if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({ message: "Payload inválido" });
        };

        if (!name.trim() || !email.trim() || !password.trim()) {
            return res.status(400).json({ message: "Payload inválido" });
        };

        if  (!isValidEmail(email)) {
            return res.status(400).json({ message: "Email inválido" });
        };

        if (password.length < 6) {
            return res.status(400).json({ message: "A senha deve ter no mínimo 6 caracteres" });
        };

        const result = await AuthService.register({name, email, password});

        if (!result.ok) {
            return res.status(result.status).json({ message: result.message });
        };

        return res.status(201).json(result.data);
    },
};