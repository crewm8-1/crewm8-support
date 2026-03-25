import path from "path";
import { pool } from "./index";
import { runner } from "node-pg-migrate";

let migratePromise: Promise<void> | null = null;

export function migrate(): Promise<void> {
  if (!migratePromise) {
    migratePromise = runMigrations();
  }
  return migratePromise;
}

async function runMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
    await runner({
      dbClient: client,
      migrationsTable: "pgmigrations",
      dir: path.resolve(__dirname, "../../migrations"),
      direction: "up",
      count: Infinity,
      noLock: true,
      log: console.log,
    });
  } finally {
    client.release();
  }
}
