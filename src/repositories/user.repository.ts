import { prisma } from "../database/prisma";
import type { Prisma } from "@prisma/client";

const userSafeSelect = {
  id: true,
  name: true,
  email: true,
  roleId: true,
  createdAt: true,
  role: { select: { id: true, name: true, createdAt: true } },
} satisfies Prisma.UserSelect;

export type UserSafe = Prisma.UserGetPayload<{ select: typeof userSafeSelect }>;

export const UserRepository = {
  // usado internamente (ex: auth). NÃO retornar em resposta HTTP.
  findByEmailWithPassword(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  },

  // seguro para resposta HTTP (sem passwordHash)
  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: userSafeSelect,
    });
  },

  // seguro para resposta HTTP
  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: userSafeSelect,
    });
  },

  // cria usuário e já retorna versão segura
  async create(data: { name: string; email: string; passwordHash: string; roleId: string }) {
    await prisma.user.create({ data });
    return this.findByEmail(data.email);
  },
};