import app from "./app";
import { config } from "./config";
import { migrate } from "./db/migrate";

async function start() {
  await migrate();
  console.log("Database migrations applied");

  app.listen(config.port, () => {
    console.log(`Crewm8 API listening on port ${config.port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});
