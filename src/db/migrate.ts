import { pool } from "./index";

export async function migrate(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS agents (
      id SERIAL PRIMARY KEY,
      agent_id VARCHAR(64) UNIQUE NOT NULL,
      token_hash VARCHAR(255) NOT NULL,
      harness VARCHAR(32) NOT NULL,
      agent_name VARCHAR(255) NOT NULL,
      operator_name VARCHAR(255) NOT NULL,
      operator_email VARCHAR(255) NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}
