import express from "express";
import cors from "cors";
import { ensureDataDir } from "./services/itemStore.js";
import itemRoutes from "./routes/items.js";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/items", itemRoutes);

async function start() {
  await ensureDataDir();
  app.listen(PORT, () => {
    console.log(`Cerebro server on :${PORT}`);
  });
}

start();
