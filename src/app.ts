import express from "express";
import helmet from "helmet";
import cors from "cors";

import { logger } from "./middlewares/logger";
import { errorHandler } from "./errors/errorHandler";
import routes from "./modules/health";
import { authRoutes } from "../src/modules/auth/auth.routes";
import { projectRoutes } from "./modules/project/project.routes";
import { taskRoutes } from "./modules/task/task.routes";

const app = express();

//Segurança headers;
app.use(helmet());

//Controla quais domínios podem acessar a API via navegador;

const allowedOrigin = process.env.CORS_ORIGIN;
const isDev = process.env.NODE_ENV === "development";

app.use(
    cors({
        origin:isDev ? true : allowedOrigin,
        methods: ["GET", "POST", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Autorization"],
        credentials: true,
    })
);

app.use(express.json());
app.use(logger);

// Rotas
app.use(routes);
app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);
app.use("/tasks", taskRoutes);

// Handler global de erros
app.use(errorHandler);

export default app;