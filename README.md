# Cerebro

Personal productivity tool combining a task board, ideas backlog, and journal — with embedded terminal management via tmux.

Items (tasks, ideas, journal entries) are stored as flat markdown files with YAML frontmatter in `data/items/`, editable with any external editor.

## Prerequisites

- Node.js 20+
- tmux (for terminal integration)

## Setup

```sh
npm install
```

## Running

Start both server and client in one command:

```sh
npm run dev
```

Or run them separately:

```sh
npm run dev -w server   # Express API on :3001
npm run dev -w client   # Vite dev server on :5173 (proxies /api and /ws to :3001)
```

## Linting & Type Checking

```sh
npm run lint
npm run typecheck
```
