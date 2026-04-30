import { Request, Response } from "express";
import { AuditService } from "./audit.service";

export const AuditController = {
    async findAll(req: Request, res: Response) {
        const { userId, entity, action, from, to, page, limit } = req.query as {
            userId?: string;
            entity?: string;
            action?: string;
            from?: string;
            to?: string;
            page?: string;
            limit?: string;
        };

        const result = await AuditService.findAll({
            userId,
            entity,
            action,
            from,
            to,
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
        });

        return res.status(200).json(result);
    },
};