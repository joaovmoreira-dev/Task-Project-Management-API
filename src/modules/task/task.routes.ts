import { Router } from "express";
import { TaskController } from "./task.controller";
import { authMiddleware } from "../../middlewares/authBearer";
import { requireRole } from "../../middlewares/requireRole";

export const taskRoutes = Router();

taskRoutes.use(authMiddleware);

taskRoutes.post("/", requireRole("ADMIN" , "MANAGER"), TaskController.create);
taskRoutes.get("/", TaskController.findAll);
taskRoutes.get("/:id", TaskController.findById);
taskRoutes.patch("/:id", requireRole("ADMIN", "MANAGER"), TaskController.update);
taskRoutes.patch("/:id/status", TaskController.updateStatus);
taskRoutes.delete("/:id", requireRole("ADMIN", "MANAGER"), TaskController.delete);