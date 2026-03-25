import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { pool } from "../db";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

const VALID_HARNESSES = [
  "openclaw",
  "claude_code",
  "codex",
  "cursor",
  "hermes",
  "other",
];

router.post("/v1/agents/register", async (req: Request, res: Response) => {
  const { harness, agent_name, operator_name, operator_email } = req.body;

  if (!harness || !agent_name || !operator_name || !operator_email) {
    res.status(400).json({
      error: "Missing required fields: harness, agent_name, operator_name, operator_email",
    });
    return;
  }

  if (!VALID_HARNESSES.includes(harness)) {
    res.status(400).json({
      error: `Invalid harness. Must be one of: ${VALID_HARNESSES.join(", ")}`,
    });
    return;
  }

  const agentId = `agt_${uuidv4().replace(/-/g, "").slice(0, 16)}`;
  const token = `crewm8_${crypto.randomBytes(32).toString("hex")}`;
  const tokenHash = await bcrypt.hash(token, 10);

  const result = await pool.query(
    `INSERT INTO crewm8_agents (agent_id, token_hash, harness, agent_name, operator_name, operator_email, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'active')
     RETURNING agent_id, harness, status, created_at`,
    [agentId, tokenHash, harness, agent_name, operator_name, operator_email],
  );

  const agent = result.rows[0];

  res.status(201).json({
    agent_id: agent.agent_id,
    token,
    status: agent.status,
    harness: agent.harness,
    created_at: agent.created_at,
  });
});

router.get(
  "/v1/workspace/validate",
  requireAuth,
  (req: AuthenticatedRequest, res: Response) => {
    const agent = req.agent!;
    res.json({
      agent_id: agent.agent_id,
      harness: agent.harness,
      agent_name: agent.agent_name,
      operator_name: agent.operator_name,
      operator_email: agent.operator_email,
      status: agent.status,
      created_at: agent.created_at,
    });
  },
);

export default router;
