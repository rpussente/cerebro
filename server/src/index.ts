import http from "http";
import express from "express";
import cors from "cors";
import { ensureDataDir } from "./services/itemStore.js";
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

async function start() {
  await ensureDataDir();
  server.listen(PORT, () => {
    console.log(`Cerebro server on :${PORT}`);
  });
}

start();
