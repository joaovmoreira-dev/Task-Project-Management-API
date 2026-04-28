import { AuditAction } from "@prisma/client";
import { AuditRepository } from "./audit.repository";

type AuditInput = {
    userId?: string;
    action: AuditAction;
    entity?: string;
    entityId?: string;
};

export const AuditService = {
    async log(input: AuditInput): Promise<void> {
        try {
            await AuditRepository.create(input);
        } catch (err) {
            console.error("[AuditService] Falha ao registrar log", err);
        }
    },
};