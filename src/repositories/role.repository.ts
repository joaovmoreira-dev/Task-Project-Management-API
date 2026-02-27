import { prisma } from "../database/prisma";
import type { RoleName } from "@prisma/client";

export const RoleRepository = {
    findByName(name: RoleName) {
        return prisma.role.findUnique({ where: { name }});
    },
};