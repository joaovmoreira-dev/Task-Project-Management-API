import { Router } from "express";
import { TaskController } from "./task.controller";
import { authMiddleware } from "../../middlewares/authBearer";

export const taskRoutes = Router();

taskRoutes.use(authMiddleware);

taskRoutes.post("/", TaskController.create);
taskRoutes.get("/", TaskController.findAll);
taskRoutes.get("/:id", TaskController.findById);
taskRoutes.patch("/:id", TaskController.update);
taskRoutes.patch("/:id/status", TaskController.updateSatus);
taskRoutes.delete("/:id", TaskController.delete);