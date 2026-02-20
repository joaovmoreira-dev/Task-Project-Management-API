import express from "express";
import { logger } from "./middlewares/logger";
import { errorHandler } from "./errors/errorHandler";
import routes from "./routes";

const app = express();

app.use(express.json());
app.use(logger);

// Rotas
app.use(routes);

// Handler global de erros (sempre por último)
app.use(errorHandler);

export default app;