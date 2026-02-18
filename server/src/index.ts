import http from "http";
import express from "express";
import cors from "cors";
import { ensureDataDir } from "./services/itemStore.js";
import { listSessions, killSession } from "./services/tmuxManager.js";
import itemRoutes from "./routes/items.js";
import tmuxRoutes from "./routes/tmux.js";
import { setupTerminalWebSocket } from "./ws/terminalHandler.js";

const app = express();
const server = http.createServer(app);
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/items", itemRoutes);
app.use("/api/tmux", tmuxRoutes);

setupTerminalWebSocket(server);

async function cleanupSessions() {
  const sessions = await listSessions();
  for (const session of sessions) {
    console.log(`Killing tmux session: ${session.name}`);
    await killSession(session.name);
  }
}

async function shutdown() {
  console.log("\nShutting down...");
  await cleanupSessions();
  server.close(() => {
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

async function start() {
  await ensureDataDir();
  server.listen(PORT, () => {
    console.log(`Cerebro server on :${PORT}`);
  });
}

start();
