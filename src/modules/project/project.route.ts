import { Router } from "express";
import { ProjectController } from "./project.controller";
import { authMiddleware } from "../../middlewares/authBearer";

export const projectRoutes = Router();

projectRoutes.use(authMiddleware);

projectRoutes.post("/", ProjectController.create);
projectRoutes.get("/", ProjectController.findAll);
projectRoutes.get("/:id", ProjectController.findById);
projectRoutes.patch("/:id", ProjectController.update);
projectRoutes.delete("/:id", ProjectController.delete);