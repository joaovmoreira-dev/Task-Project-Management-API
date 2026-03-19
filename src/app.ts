import express from "express";
import helmet from "helmet";
import cors from "cors";

import { logger } from "./middlewares/logger";
import { errorHandler } from "./errors/errorHandler";
import routes from "./modules/health";
import { authRoutes } from "../src/modules/auth/auth.routes";
import { projectRoutes } from "./modules/project/project.route";

const app = express();

//Segurança headers;
app.use(helmet());

//Controla quais domínios podem acessar a API via navegador;
app.use(
    cors({
        origin:true,
        credentials: true,
    })
);

app.use(express.json());
app.use(logger);

// Rotas
app.use(routes);
app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);

// Handler global de erros
app.use(errorHandler);

export default app;