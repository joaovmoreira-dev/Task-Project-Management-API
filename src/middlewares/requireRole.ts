import { Request, Response, NextFunction } from "express";

type Role = "ADMIN" | "MANAGER" | "MEMBER";

export function requireRole(...roles: Role[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const role = req.auth?.role;

        if( !role ||!roles.includes(role as Role)) {
            return res.status(403).json({ message: "Sem permissão" });
        };

        return next();
    };
};