import { useState, useCallback } from "react";
import type { TmuxSession } from "../../api/tmux.js";
import { listTmuxSessions, killTmuxSession } from "../../api/tmux.js";

interface Props {
  selected: string | null;
  onSelect: (session: string | null) => void;
}

function useSessions() {
  const [sessions, setSessions] = useState<TmuxSession[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const list = await listTmuxSessions();
      setSessions(list);
    } catch (e) {
      console.error("Failed to list sessions:", e);
    } finally {
      setLoaded(true);
    }
  }, []);

  if (!loaded) {
    refresh();
  }

  return { sessions, loaded, refresh };
}

export default function SessionPicker({ selected, onSelect }: Props) {
  const { sessions, loaded, refresh } = useSessions();

  const handleKill = async (name: string) => {
    if (!confirm(`Kill session ${name}?`)) return;
    try {
      await killTmuxSession(name);
      if (selected === name) onSelect(null);
      await refresh();
    } catch (e) {
      console.error("Failed to kill session:", e);
    }
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <select
          value={selected ?? ""}
          onChange={(e) => onSelect(e.target.value || null)}
          style={{
            flex: 1,
            padding: "0.4rem 0.6rem",
            background: "#0d0d1a",
            border: "1px solid #444",
            borderRadius: 4,
            color: "#eee",
            fontSize: "0.9rem",
          }}
        >
          <option value="">Select a session...</option>
          {sessions.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name} {s.attached ? "(attached)" : ""}
            </option>
          ))}
        </select>
        <button
          onClick={() => refresh()}
          style={{
            padding: "0.4rem 0.8rem",
            border: "1px solid #555",
            borderRadius: 4,
            background: "transparent",
            color: "#ccc",
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          Refresh
        </button>
        {selected && (
          <button
            onClick={() => handleKill(selected)}
            style={{
              padding: "0.4rem 0.8rem",
              border: "1px solid #833",
              borderRadius: 4,
              background: "transparent",
              color: "#c66",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            Kill
          </button>
        )}
      </div>
      {loaded && sessions.length === 0 && (
        <p style={{ color: "#888", margin: "0.5rem 0 0" }}>
          No active sessions. Delegate a task to start one.
        </p>
      )}
    </div>
  );
}
