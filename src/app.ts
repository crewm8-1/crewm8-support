import express from "express";
import healthRouter from "./routes/health";
import agentsRouter from "./routes/agents";

const app = express();

app.use(express.json());
app.use(healthRouter);
app.use(agentsRouter);

export default app;
