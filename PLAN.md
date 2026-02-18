# Cerebro — Implementation Plan

> **Status tracking**: Check off items as they're completed. Each phase should be fully verified before moving to the next.

## Context

Cerebro is a personal productivity and AI orchestration tool. It combines a task board (with delegation to Claude Code CLI via tmux), an ideas backlog, and a journal/notes system — all controlled through a web UI. The core value proposition is managing Claude Code sessions from a browser with embedded terminals, alongside structured note-taking and task management.

## Tech Stack

- **Frontend**: React + Vite + TypeScript
- **Backend**: Node.js + Express + TypeScript
- **Storage**: Flat markdown files with YAML frontmatter (editable in any external editor)
- **Terminal**: xterm.js (browser) ↔ WebSocket ↔ node-pty ↔ tmux
- **Process Management**: tmux sessions prefixed with `mf-`

## Directory Structure

```
cerebro/
├── client/                    # React + Vite
│   ├── package.json
│   ├── vite.config.ts         # Proxy /api and /ws to Express
│   └── src/
│       ├── App.tsx
│       ├── api/
│       │   └── items.ts       # Typed fetch wrappers for unified item API
│       ├── components/
│       │   ├── Layout.tsx
│       │   ├── tasks/         # TaskBoard, TaskCard, TaskForm
│       │   ├── ideas/         # IdeaList, IdeaCard, IdeaForm
│       │   ├── journal/       # JournalList, JournalEntry, JournalEditor
│       │   └── terminal/      # TerminalPanel, SessionPicker
│       └── hooks/
│           └── useTerminal.ts # xterm.js + WebSocket lifecycle
├── server/                    # Node + Express
│   ├── package.json
│   └── src/
│       ├── index.ts           # Express app + WS upgrade handler
│       ├── routes/
│       │   ├── items.ts       # Unified item CRUD + filtering
│       │   └── tmux.ts        # tmux session management
│       ├── services/
│       │   ├── itemStore.ts   # Read/write markdown files with gray-matter
│       │   └── tmuxManager.ts # Spawn/list/kill tmux sessions
│       └── ws/
│           └── terminalHandler.ts  # WebSocket ↔ node-pty ↔ tmux bridge
├── shared/                    # Shared TypeScript types
│   └── types.ts
├── data/                      # Flat file storage (gitignored)
│   └── items/                 # All items as YYYY-MM-DD-slug.md files
├── package.json               # npm workspaces root
└── .gitignore
```

## Data Model (`shared/types.ts`)

All items are markdown files with YAML frontmatter, stored in `data/items/`. Every file is editable in vim, VS Code, or any text editor.

**Example task file** (`data/items/2026-02-17-fix-login-bug.md`):
```yaml
---
id: a1b2c3d4
kind: task
title: Fix the login bug
status: in-progress
tags: [auth, bug]
tmuxSession: mf-a1b2c3d4
createdAt: 2026-02-17T10:00:00Z
updatedAt: 2026-02-17T11:30:00Z
---

The login form throws a 500 when the email contains a plus sign.
Need to URL-encode before sending to the backend.
```

**Example journal entry** (`data/items/2026-02-17-weekly-reflection.md`):
```yaml
---
id: e5f6g7h8
kind: journal
title: Weekly reflection
tags: [reflection, q1-2026]
createdAt: 2026-02-17T18:00:00Z
updatedAt: 2026-02-17T18:00:00Z
---

This week I shipped the auth refactor and started on the API redesign...
```

**TypeScript types**:
```typescript
interface BaseItem {
  id: string;
  kind: "task" | "idea" | "journal";
  title: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  body: string; // markdown content below frontmatter
}

interface TaskItem extends BaseItem {
  kind: "task";
  status: "backlog" | "delegated" | "in-progress" | "done";
  tmuxSession?: string;
}

interface IdeaItem extends BaseItem {
  kind: "idea";
}

interface JournalItem extends BaseItem {
  kind: "journal";
}

type Item = TaskItem | IdeaItem | JournalItem;
```

## API Endpoints

Single unified resource with filtering:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/items` | List items. Filter: `?kind=task`, `?tag=bug`, `?q=search`, `?status=backlog` |
| GET | `/api/items/:id` | Get single item |
| POST | `/api/items` | Create item (kind required) |
| PUT | `/api/items/:id` | Update item (change any field including kind) |
| DELETE | `/api/items/:id` | Delete item |
| POST | `/api/items/:id/delegate` | Task-only: spawn tmux + Claude session |
| POST | `/api/items/:id/promote` | Change kind from `idea` to `task`, set status to `backlog` |
| GET | `/api/tmux/sessions` | List active `mf-*` tmux sessions |
| DELETE | `/api/tmux/sessions/:name` | Kill a tmux session |

## Terminal Architecture

**WebSocket endpoint**: `ws://localhost:3001/ws/terminal?session=mf-abc123`

**Flow**:
1. Client opens WebSocket with session name
2. Server spawns `node-pty` running `tmux attach-session -t <session>`
3. Bidirectional pipe: pty output → WS → xterm.js, and keystrokes → WS → pty
4. Resize messages sent as JSON `{"type":"resize","cols":N,"rows":N}`
5. On WS close, pty process is killed but tmux session stays alive

**Task delegation flow**:
1. `tmux new-session -d -s mf-<id> -x 200 -y 50`
2. `tmux send-keys -t mf-<id> 'claude' Enter`
3. Wait 2s for CLI to start
4. `tmux send-keys -t mf-<id> '<task prompt>' Enter`
5. Update item status to `delegated` with session name

## Key Dependencies

**Server**: express, ws, node-pty, gray-matter, uuid, cors
**Client**: react-router-dom, @xterm/xterm, @xterm/addon-fit, @xterm/addon-web-links, react-markdown
**Dev**: concurrently, typescript, ts-node-dev

---

## Phase 1: Scaffolding + Data Layer ✅

- [x] Root `package.json` with npm workspaces (`client`, `server`, `shared`)
- [x] `tsconfig.base.json` with shared TypeScript config
- [x] `.gitignore` (node_modules, dist, data/)
- [x] `shared/types.ts` — `Item` discriminated union (TaskItem | IdeaItem | JournalItem)
- [x] `shared/package.json`
- [x] `server/package.json` with dependencies
- [x] `server/tsconfig.json`
- [x] `server/src/index.ts` — Express app with health check, data dir init
- [x] `server/src/services/itemStore.ts` — CRUD on `data/items/*.md` using `gray-matter`
- [x] `server/src/routes/items.ts` — Unified item REST endpoints with filtering
- [x] Scaffold `client/` via `npm create vite@latest`
- [x] `client/vite.config.ts` — Proxy `/api` and `/ws` to Express
- [x] Root `dev` script using `concurrently` to run both
- [x] **Verify**: `npm run dev` → `curl localhost:3001/api/items` returns `[]`, client loads at `:5173`

## Phase 2: Task Board + Ideas UI ✅

- [x] `client/src/api/items.ts` — Typed fetch wrappers (list with filters, get, create, update, delete)
- [x] `client/src/components/Layout.tsx` — Sidebar nav (Tasks, Ideas, Journal, Terminal)
- [x] `client/src/App.tsx` — React Router setup with routes
- [x] `client/src/components/tasks/TaskBoard.tsx` — Columns: Backlog, In Progress, Done (filtered by kind=task)
- [x] `client/src/components/tasks/TaskCard.tsx` — Task display with status change buttons
- [x] `client/src/components/tasks/TaskForm.tsx` — Create/edit task modal
- [x] `client/src/components/ideas/IdeaList.tsx` — List items where kind=idea
- [x] `client/src/components/ideas/IdeaCard.tsx` — Single idea display
- [x] `client/src/components/ideas/IdeaForm.tsx` — Create/edit idea
- [x] "Promote to Task" action — calls `POST /api/items/:id/promote`
- [x] **Verify**: Create/edit/delete tasks and ideas through the UI, refresh to confirm persistence. Open a file in external editor, change it, refresh UI to see update.

## Phase 3: Journal/Notes

- [ ] `client/src/components/journal/JournalEditor.tsx` — Markdown textarea + live preview
- [ ] `client/src/components/journal/JournalList.tsx` — Timeline view with search/tag filter
- [ ] `client/src/components/journal/JournalEntry.tsx` — Render single markdown entry
- [ ] **Verify**: Create journal entries, search works, markdown renders, timeline sorts by date

## Phase 4: tmux + Terminal

- [ ] `server/src/services/tmuxManager.ts` — Spawn/list/kill `mf-*` tmux sessions
- [ ] `server/src/routes/tmux.ts` — REST endpoints for tmux session management
- [ ] Delegation endpoint (`POST /api/items/:id/delegate`) in items route
- [ ] `server/src/ws/terminalHandler.ts` — WebSocket ↔ node-pty ↔ tmux bridge
- [ ] Wire WebSocket upgrade handler in `server/src/index.ts`
- [ ] `client/src/hooks/useTerminal.ts` — xterm.js + WebSocket lifecycle hook
- [ ] `client/src/components/terminal/TerminalPanel.tsx` — xterm.js container
- [ ] `client/src/components/terminal/SessionPicker.tsx` — Dropdown to pick active session
- [ ] "Delegate" button on TaskCard that triggers delegation flow
- [ ] **Verify**: Delegate task → tmux spawns → embedded terminal shows Claude → can type in it

## Phase 5: Polish

- [ ] Tag filtering across all views
- [ ] Session status indicators (running/stopped) on task cards
- [ ] Minimal CSS styling
- [ ] Loading states and error handling in UI
- [ ] Graceful tmux session cleanup on server shutdown
- [ ] **Verify**: Full e2e flow — create idea → promote to task → delegate → interact → mark done

## Phase 6: External Editor Integration

- [ ] Add `chokidar` file watcher on `data/items/` directory in server
- [ ] Emit file change events via WebSocket to connected clients (new/modified/deleted)
- [ ] Client listens for change events and auto-refreshes item lists without manual reload
- [ ] Handle conflict detection — if a file is modified externally while being edited in the UI, warn the user
- [ ] Add "Open in editor" button on items that runs `$EDITOR` or copies the file path to clipboard
- [ ] Validate frontmatter on external file changes — surface parse errors in the UI instead of silently ignoring malformed files
- [ ] **Verify**: Create/edit a markdown file in vim or VS Code in `data/items/`, confirm the UI updates automatically within seconds
