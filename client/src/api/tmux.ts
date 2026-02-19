export interface TmuxSession {
  name: string;
  attached: boolean;
}

const BASE = "/api/tmux";

export async function listTmuxSessions(): Promise<TmuxSession[]> {
  const res = await fetch(`${BASE}/sessions`);
  if (!res.ok) throw new Error(`Failed to list tmux sessions: ${res.status}`);
  return res.json();
}

export async function killTmuxSession(name: string): Promise<void> {
  const res = await fetch(`${BASE}/sessions/${name}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to kill tmux session: ${res.status}`);
}
