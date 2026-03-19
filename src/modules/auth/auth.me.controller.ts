import type { Request, Response } from "express";
import { UserRepository } from "./user.repository";

export const AuthMeController = {
  async me(req: Request, res: Response) {
    if (!req.auth?.userId) {
      return res.status(401).json({ message: "Não autenticado" });
    }

    const user = await UserRepository.findById(req.auth.userId);

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    return res.status(200).json({ user });
  },
};