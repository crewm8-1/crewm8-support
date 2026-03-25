import assert from "node:assert";
import { describe, it, before, after } from "node:test";
import app from "../src/app";
import { migrate } from "../src/db/migrate";
import { pool } from "../src/db";
import type { Server } from "node:http";

let server: Server;
let baseUrl: string;
let validToken: string;

before(async () => {
  await migrate();
  await pool.query("TRUNCATE crewm8_agents CASCADE");
  server = await new Promise<Server>((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const addr = server.address();
  if (typeof addr === "object" && addr) {
    baseUrl = `http://localhost:${addr.port}`;
  }

  // Register an agent for testing
  const res = await fetch(`${baseUrl}/v1/agents/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      harness: "claude_code",
      agent_name: "workspace-test-agent",
      operator_name: "Test Operator",
      operator_email: "test@example.com",
    }),
  });
  const body = await res.json();
  validToken = body.token;
});

after(async () => {
  server?.close();
  await pool.end();
});

describe("GET /v1/workspace/config", () => {
  it("returns workspace config for authenticated agent", async () => {
    const res = await fetch(`${baseUrl}/v1/workspace/config`, {
      headers: { Authorization: `Bearer ${validToken}` },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.ok(body.workspace_id.startsWith("ws_"));
    assert.strictEqual(body.agent_name, "workspace-test-agent");
    assert.strictEqual(body.operator_name, "Test Operator");
    assert.strictEqual(body.company_name, "Crewm8");
    assert.ok(Array.isArray(body.initial_contacts));
    assert.ok(Array.isArray(body.projects));
  });

  it("returns 401 without token", async () => {
    const res = await fetch(`${baseUrl}/v1/workspace/config`);
    assert.strictEqual(res.status, 401);
  });
});

describe("GET /v1/agents/me/instructions", () => {
  it("returns markdown instructions for authenticated agent", async () => {
    const res = await fetch(`${baseUrl}/v1/agents/me/instructions`, {
      headers: { Authorization: `Bearer ${validToken}` },
    });

    assert.strictEqual(res.status, 200);
    assert.ok(res.headers.get("content-type")?.includes("text/markdown"));
    const text = await res.text();
    assert.ok(text.includes("workspace-test-agent"));
    assert.ok(text.includes("Crewm8 Agent Instructions"));
  });

  it("returns 401 without token", async () => {
    const res = await fetch(`${baseUrl}/v1/agents/me/instructions`);
    assert.strictEqual(res.status, 401);
  });
});
