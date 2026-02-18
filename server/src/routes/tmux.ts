import { Router } from "express";
import { listSessions, killSession } from "../services/tmuxManager.js";

const router = Router();

router.get("/sessions", async (_req, res) => {
  const sessions = await listSessions();
  res.json(sessions);
});

router.delete("/sessions/:name", async (req, res) => {
  const killed = await killSession(req.params.name);
  if (!killed) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  res.status(204).send();
});

export default router;
