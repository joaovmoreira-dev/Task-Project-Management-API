import { prisma } from "../../database/prisma";
import { AuditAction } from "@prisma/client";

type CreateAuditLogDTO = {
    userId?: string;
    action: AuditAction;
    entity?: string;
    entityId?: string;
};

export const AuditRepository = {
    async create (data: CreateAuditLogDTO) {
        return prisma.auditLog.create({
            data: {
                userId: data.userId,
                action: data.action,
                entity: data.entity,
                entityId: data.entityId,
            },
        });
    },
};