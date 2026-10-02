import env, { assertProductionSecrets } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { createApp } from "./app.js";

async function start() {
  assertProductionSecrets();
  await connectDB();
  const app = createApp();
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] Aurex API listening on http://localhost:${env.port} (${env.nodeEnv})`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[server] Failed to start:", err);
  process.exit(1);
});
