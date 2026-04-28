import bcrypt from "bcrypt";
import jwt, { type Secret ,type SignOptions } from "jsonwebtoken";
import { UserRepository } from "../auth/user.repository";
import type { StringValue } from "ms"
import { RoleRepository } from "../auth/role.repository";
import { AuditService } from "../audit/audit.service";

type LoginInput = { email: string; password: string};

type RegisterInput = { name: string; email: string; password: string };

export const AuthService = {
    async login(input: LoginInput) {
        const email = input.email.trim().toLowerCase();

        if (!email) {
            return {
                ok: false as const,
                status: 400,
                message: "Email é obrigatório"
            }
        };

        if (!input.password) {
            return {
                ok: false as const,
                status: 400,
                message: "Senha é obrigatória"
            }   
        }

        const invalid = () => ({
            ok: false as const,
            status: 401 as const,
            message: "Credenciais inválidas",
        });

        const user = await UserRepository.findByEmailWithPassword(email);
        if (!user) {
            await AuditService.log({ action: "LOGIN_FAILED" });
            return invalid();
        }

        const match = await bcrypt.compare(input.password, user.passwordHash);
        if (!match) {
            await AuditService.log({ action: "LOGIN_FAILED" });
            return invalid();
        }
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
            {userId: user.id, role: user.role.name },
            secret as Secret,
            {expiresIn}
        );

        const userSafe = await UserRepository.findById(user.id);
        if (!userSafe) {
            return {
                ok: false as const,
                status: 500 as const,
                message: "Erro interno",
            };
        }

        await AuditService.log({ userId: user.id, action: "LOGIN_SUCCESS" });

        return {
            ok: true as const,
            status: 200 as const,
            data: {accessToken, user:userSafe}
        }
    },
    async register (input: RegisterInput) {
        const name = input.name.trim();
        const email = input.email.trim().toLocaleLowerCase();
        const password = input.password;

        if(!name) {
            return { 
                ok: false as const,
                status: 400 as const,
                message: "Nome é obrigatório"
             };
        };

        if(name.length > 100) {
            return {
                ok: false as const,
                status: 400 as const,
                message: "Nome deve ter no máximo 100 caracteres"
            };
        };

        if(!email) {   
            return {
                ok: false as const,
                status: 400 as const,
                message: "Email é obrigatório"
            };
        };

        if(email.length > 150) {
            return {
                ok: false as const,
                status: 400 as const,
                message: "Email inválido"
            };
        };

        if(!password || password.length < 6) {
            return {
                ok: false as const,
                status: 400,
                message: "Senha deve ter no mínimo 6 caracteres"
            }
        };

        const existingUser = await UserRepository.findByEmailWithPassword(email);
        if(existingUser) {
            return {
                ok: false as const,
                status: 409 as const,
                message: "Email já cadastrado",
            };
        }

        const memberRole = await RoleRepository.findByName("MEMBER");
        if(!memberRole) {
            return {
                ok: false as const,
                status: 500 as const,
                message: "Erro interno",
            };
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const createdUser = await UserRepository.create({
            name,
            email,
            passwordHash,
            roleId: memberRole.id,
        });

        return {
            ok: true as const,
            status: 201 as const,
            data: {
                user: createdUser,
            },
        };
    },
};