import { useState, useRef } from "react";
import { useTerminal } from "../../hooks/useTerminal.js";
import SessionPicker from "./SessionPicker.js";
import "@xterm/xterm/css/xterm.css";

export default function TerminalPanel() {
  const [session, setSession] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useTerminal(containerRef, session);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 2rem)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Terminal</h1>
      </div>
      <SessionPicker selected={session} onSelect={setSession} />
      <div
        ref={containerRef}
        style={{
          flex: 1,
          background: "#0d0d1a",
          borderRadius: 8,
          border: "1px solid #444",
          padding: 4,
          display: session ? "block" : "none",
        }}
      />
      {!session && (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#888",
            border: "1px solid #444",
            borderRadius: 8,
            background: "#0d0d1a",
          }}
        >
          Select a session to connect
        </div>
      )}
    </div>
  );
}
