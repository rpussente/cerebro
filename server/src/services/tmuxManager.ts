import { execFile } from "child_process";
import { promisify } from "util";

const exec = promisify(execFile);

const SESSION_PREFIX = "mf-";
const SESSION_NAME_RE = /^mf-[a-zA-Z0-9_-]+$/;

export interface TmuxSession {
  name: string;
  attached: boolean;
}

export async function listSessions(): Promise<TmuxSession[]> {
  try {
    const { stdout } = await exec("tmux", [
      "list-sessions",
      "-F",
      "#{session_name}\t#{session_attached}",
    ]);
    return stdout
      .trim()
      .split("\n")
      .filter((line) => line.startsWith(SESSION_PREFIX))
      .map((line) => {
        const [name, attached] = line.split("\t");
        return { name, attached: attached === "1" };
      });
  } catch {
    // tmux returns exit code 1 when no sessions exist
    return [];
  }
}

export async function createSession(sessionName: string): Promise<void> {
  await exec("tmux", [
    "new-session",
    "-d",
    "-s",
    sessionName,
    "-x",
    "200",
    "-y",
    "50",
  ]);
}

export async function killSession(sessionName: string): Promise<boolean> {
  if (!SESSION_NAME_RE.test(sessionName)) return false;
  try {
    await exec("tmux", ["kill-session", "-t", sessionName]);
    return true;
  } catch {
    return false;
  }
}

export async function sendKeys(
  sessionName: string,
  keys: string
): Promise<void> {
  await exec("tmux", ["send-keys", "-t", sessionName, keys, "Enter"]);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sanitizePrompt(prompt: string): string {
  return prompt.replace(/[\x00-\x1F\x7F]/g, "").slice(0, 2000);
}

export async function delegateTask(
  taskId: string,
  prompt: string
): Promise<string> {
  const sessionName = `${SESSION_PREFIX}${taskId.slice(0, 8)}`;
  await createSession(sessionName);
  await sendKeys(sessionName, "claude");
  await sleep(2000);
  await sendKeys(sessionName, sanitizePrompt(prompt));
  return sessionName;
}
