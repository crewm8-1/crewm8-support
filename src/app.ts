import express from "express";
import healthRouter from "./routes/health";
import agentsRouter from "./routes/agents";
import workspaceRouter from "./routes/workspace";

const app = express();

app.use(express.json());
app.use(healthRouter);
app.use(agentsRouter);
app.use(workspaceRouter);

export default app;
