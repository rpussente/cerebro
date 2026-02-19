import { WebSocketServer, WebSocket } from "ws";
import * as pty from "node-pty";
import type { IncomingMessage } from "http";
import type { Server } from "http";

export function setupTerminalWebSocket(server: Server): void {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req: IncomingMessage, socket, head) => {
    const url = new URL(req.url ?? "", `http://${req.headers.host}`);
    if (url.pathname !== "/ws/terminal") {
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    const url = new URL(req.url ?? "", `http://${req.headers.host}`);
    const session = url.searchParams.get("session");

    if (!session || !session.startsWith("mf-")) {
      ws.close(1008, "Invalid session name");
      return;
    }

    let term: pty.IPty;
    try {
      term = pty.spawn("tmux", ["attach-session", "-t", session], {
        name: "xterm-256color",
        cols: 200,
        rows: 50,
        cwd: process.env.HOME ?? "/",
      });
    } catch {
      ws.close(1011, "Failed to attach to session");
      return;
    }

    term.onData((data: string) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });

    term.onExit(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });

    ws.on("message", (msg: Buffer | string) => {
      const str = msg.toString();
      try {
        const parsed = JSON.parse(str);
        if (parsed.type === "resize" && parsed.cols && parsed.rows) {
          term.resize(parsed.cols, parsed.rows);
          return;
        }
      } catch {
        // not JSON, treat as terminal input
      }
      term.write(str);
    });

    ws.on("close", () => {
      term.kill();
    });
  });
}
