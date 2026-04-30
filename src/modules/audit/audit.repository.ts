import { prisma } from "../../database/prisma";
import { AuditAction } from "@prisma/client";

type CreateAuditLogDTO = {
    userId?: string;
    action: AuditAction;
    entity?: string;
    entityId?: string;
};

type FindAuditLogsDTO = {
    userId?: string;
    entity?: string;
    action?: AuditAction;
    from?: Date;
    to?: Date;
    page?: number;
    limit?: number;
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

    async findAll(filters: FindAuditLogsDTO) {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 20;
        const skip = (page - 1) * limit;

        const where = {
            ...(filters.userId && { userId: filters.userId }),
            ...(filters.entity && { entity: filters.entity }),
            ...(filters.action && { action: filters.action }),
            ...(filters.from || filters.to) && {
                createdAt: {
                    ...(filters.from && { gte: filters.from }),
                    ...(filters.to && { lte: filters.to }),
                },
            },
        };

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
                select: {
                    id: true,
                    action: true,
                    entity: true,
                    entityId: true,
                    createdAt: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            }),
            prisma.auditLog.count({ where })
        ]);

        return { logs, total, page, limit };
    },
};