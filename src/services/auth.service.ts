import bcrypt from "bcrypt";
import jwt, { type Secret ,type SignOptions } from "jsonwebtoken";
import { UserRepository } from "../repositories/user.repository";
import type { StringValue } from "ms"


type LoginInput = { email: string; password: string};

export const AuthService = {
    async login(input: LoginInput) {
        const email = input.email.trim().toLowerCase();

        const invalid = () => ({
            ok: false as const,
            status: 402 as const,
            message: "Credenciais inválidas",
        });

        const user = await UserRepository.findByEmailWithPassword(email);
        if (!user) return invalid();

        const match = await bcrypt.compare(input.password, user.passwordHash);
        if (!match) return invalid();

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            //erro de infra, não é culpa do cliente
            return {
                ok: false as const,
                status: 500 as const,
                message: "Erro interno",
            };
        }
        const expiresIn: SignOptions["expiresIn"] = (process.env.JWT_EXPIRES_IN as StringValue | undefined) ?? "15m";

        const accessToken = jwt.sign(
            {userId: user.id, role: user.role?.name },
            secret as Secret,
            {expiresIn}
        );

        const userSafe = await UserRepository.findById(user.id);
        if (!userSafe) {
            return {
                ok: false as const,
                status: 500 as const,
                message: "Erro Interno",
            };
        }

        return {
            ok: true as const,
            status: 200 as const,
            data: {accessToken, user:userSafe}
        }
    }
}