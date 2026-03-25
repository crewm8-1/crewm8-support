import assert from "node:assert";
import { describe, it, before, after } from "node:test";
import app from "../src/app";
import { migrate } from "../src/db/migrate";
import { pool } from "../src/db";
import type { Server } from "node:http";

let server: Server;
let baseUrl: string;

before(async () => {
  await migrate();
  await pool.query("DELETE FROM agents");
  server = await new Promise<Server>((resolve) => {
    const s = app.listen(0, () => resolve(s));
  });
  const addr = server.address();
  if (typeof addr === "object" && addr) {
    baseUrl = `http://localhost:${addr.port}`;
  }
});

after(async () => {
  server?.close();
  await pool.end();
});

describe("POST /v1/agents/register", () => {
  it("registers an agent and returns token", async () => {
    const res = await fetch(`${baseUrl}/v1/agents/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        harness: "claude_code",
        agent_name: "test-agent",
        operator_name: "Test Op",
        operator_email: "test@example.com",
      }),
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.ok(body.agent_id.startsWith("agt_"));
    assert.ok(body.token.startsWith("crewm8_"));
    assert.strictEqual(body.status, "active");
    assert.strictEqual(body.harness, "claude_code");
    assert.ok(body.created_at);
  });

  it("rejects missing fields", async () => {
    const res = await fetch(`${baseUrl}/v1/agents/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ harness: "claude_code" }),
    });

    assert.strictEqual(res.status, 400);
  });

  it("rejects invalid harness", async () => {
    const res = await fetch(`${baseUrl}/v1/agents/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        harness: "invalid",
        agent_name: "test",
        operator_name: "test",
        operator_email: "test@test.com",
      }),
    });

    assert.strictEqual(res.status, 400);
  });
});

describe("GET /v1/workspace/validate", () => {
  let validToken: string;

  before(async () => {
    const res = await fetch(`${baseUrl}/v1/agents/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        harness: "openclaw",
        agent_name: "validate-test",
        operator_name: "Test",
        operator_email: "validate@test.com",
      }),
    });
    const body = await res.json();
    validToken = body.token;
  });

  it("validates a valid token", async () => {
    const res = await fetch(`${baseUrl}/v1/workspace/validate`, {
      headers: { Authorization: `Bearer ${validToken}` },
    });

    assert.strictEqual(res.status, 200);
    const body = await res.json();
    assert.strictEqual(body.agent_name, "validate-test");
    assert.strictEqual(body.status, "active");
  });

  it("rejects missing auth header", async () => {
    const res = await fetch(`${baseUrl}/v1/workspace/validate`);
    assert.strictEqual(res.status, 401);
  });

  it("rejects invalid token", async () => {
    const res = await fetch(`${baseUrl}/v1/workspace/validate`, {
      headers: { Authorization: "Bearer crewm8_invalidtoken" },
    });
    assert.strictEqual(res.status, 401);
  });
});
