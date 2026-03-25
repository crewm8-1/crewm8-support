import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db";

export interface AuthenticatedRequest extends Request {
  agent?: {
    id: number;
    agent_id: string;
    harness: string;
    agent_name: string;
    operator_name: string;
    operator_email: string;
    status: string;
    created_at: string;
  };
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid authorization header" });
    return;
  }

  const token = authHeader.slice(7);
  if (!token.startsWith("crewm8_")) {
    res.status(401).json({ error: "Invalid token format" });
    return;
  }

  const result = await pool.query(
    "SELECT id, agent_id, token_hash, harness, agent_name, operator_name, operator_email, status, created_at FROM crewm8_agents WHERE status = $1",
    ["active"],
  );

  for (const row of result.rows) {
    const match = await bcrypt.compare(token, row.token_hash);
    if (match) {
      req.agent = {
        id: row.id,
        agent_id: row.agent_id,
        harness: row.harness,
        agent_name: row.agent_name,
        operator_name: row.operator_name,
        operator_email: row.operator_email,
        status: row.status,
        created_at: row.created_at,
      };
      next();
      return;
    }
  }

  res.status(401).json({ error: "Invalid token" });
}
