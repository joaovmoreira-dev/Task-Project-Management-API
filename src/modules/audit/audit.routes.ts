import { Router } from "express";
import { AuditController } from "./audit.controller";
import { authMiddleware } from "../../middlewares/authBearer";
import { requireRole } from "../../middlewares/requireRole";

export const auditRoutes = Router();

auditRoutes.use(authMiddleware);
auditRoutes.use(requireRole("ADMIN"));

auditRoutes.get("/", AuditController.findAll);