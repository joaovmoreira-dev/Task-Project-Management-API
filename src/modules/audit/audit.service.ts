import { AuditAction } from "@prisma/client";
import { AuditRepository } from "./audit.repository";
import { AppError } from "../../errors/AppErrors";

type AuditInput = {
    userId?: string;
    action: AuditAction;
    entity?: string;
    entityId?: string;
};

type AuditFilters = {
    userId?: string;
    entity?: string;
    action?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
};

const VALID_ACTIONS = [
    "LOGIN_SUCCESS", "LOGIN_FAILED",
    "PROJECT_CREATED", "PROJECT_UPDATED", "PROJECT_DELETED",
    "TASK_CREATED", "TASK_UPDATED", "TASK_STATUS_CHANGED", "TASK_DELETED",
];

export const AuditService = {
    async log(input: AuditInput): Promise<void> {
        try {
            await AuditRepository.create(input);
        } catch (err) {
            console.error("[AuditService] Falha ao registrar log", err);
        }
    },

     async findAll(filters: AuditFilters) {
        if (filters.action && !VALID_ACTIONS.includes(filters.action)) {
            throw new AppError("Action inválida", 400);
        }

        const page = filters.page ? Number(filters.page) : 1;
        const limit = Math.min(filters.limit ? Number(filters.limit) : 20, 100);

        return AuditRepository.findAll({
            userId: filters.userId,
            entity: filters.entity,
            action: filters.action as AuditAction | undefined,
            from: filters.from ? new Date(filters.from) : undefined,
            to: filters.to ? new Date(filters.to) : undefined,
            page,
            limit,
        });
    },
};