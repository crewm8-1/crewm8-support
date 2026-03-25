import app from "./app";
import { config } from "./config";

app.listen(config.port, () => {
  console.log(`Crewm8 API listening on port ${config.port}`);
});
