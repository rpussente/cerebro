import { readdir, readFile, writeFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import matter from "gray-matter";
import { v4 as uuidv4 } from "uuid";
import type { Item, ItemFilters, TaskItem, IdeaItem, JournalItem } from "../../../shared/types.js";

const DATA_DIR = join(process.cwd(), "data", "items");

export async function ensureDataDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function filenameForItem(item: { createdAt: string; title: string; id: string }): string {
  const date = item.createdAt.slice(0, 10);
  const slug = slugify(item.title);
  return `${date}-${slug}-${item.id.slice(0, 8)}.md`;
}

function parseItem(content: string): Item {
  const { data, content: body } = matter(content);
  const base = {
    id: data.id as string,
    kind: data.kind as Item["kind"],
    title: data.title as string,
    tags: (data.tags as string[]) ?? [],
    createdAt: data.createdAt as string,
    updatedAt: data.updatedAt as string,
    body: body.trim(),
  };

  if (base.kind === "task") {
    return {
      ...base,
      kind: "task",
      status: data.status ?? "backlog",
      tmuxSession: data.tmuxSession,
    } as TaskItem;
  }

  return base as IdeaItem | JournalItem;
}

function serializeItem(item: Item): string {
  const { body, ...frontmatter } = item;
  return matter.stringify(body, frontmatter);
}

function matchesFilters(item: Item, filters: ItemFilters): boolean {
  if (filters.kind && item.kind !== filters.kind) return false;
  if (filters.tag && !item.tags.includes(filters.tag)) return false;
  if (filters.status && item.kind === "task" && item.status !== filters.status) return false;
  if (filters.q) {
    const q = filters.q.toLowerCase();
    const searchable = `${item.title} ${item.body} ${item.tags.join(" ")}`.toLowerCase();
    if (!searchable.includes(q)) return false;
  }
  return true;
}

export async function listItems(filters: ItemFilters = {}): Promise<Item[]> {
  await ensureDataDir();
  const files = await readdir(DATA_DIR);
  const mdFiles = files.filter((f) => f.endsWith(".md"));

  const items = await Promise.all(
    mdFiles.map(async (f) => {
      const content = await readFile(join(DATA_DIR, f), "utf-8");
      return parseItem(content);
    })
  );

  return items
    .filter((item) => matchesFilters(item, filters))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getItem(id: string): Promise<Item | undefined> {
  const items = await listItems();
  return items.find((item) => item.id === id);
}

async function findFileById(id: string): Promise<string | undefined> {
  const files = await readdir(DATA_DIR);
  for (const f of files) {
    if (!f.endsWith(".md")) continue;
    const content = await readFile(join(DATA_DIR, f), "utf-8");
    const { data } = matter(content);
    if (data.id === id) return f;
  }
  return undefined;
}

export async function createItem(
  input: Pick<Item, "kind" | "title" | "tags" | "body"> & Partial<Pick<TaskItem, "status">>
): Promise<Item> {
  await ensureDataDir();
  const now = new Date().toISOString();
  const id = uuidv4();

  const base = {
    id,
    kind: input.kind,
    title: input.title,
    tags: input.tags ?? [],
    createdAt: now,
    updatedAt: now,
    body: input.body ?? "",
  };

  let item: Item;
  if (input.kind === "task") {
    item = { ...base, kind: "task", status: input.status ?? "backlog" } as TaskItem;
  } else {
    item = base as IdeaItem | JournalItem;
  }

  const filename = filenameForItem(item);
  await writeFile(join(DATA_DIR, filename), serializeItem(item), "utf-8");
  return item;
}

export async function updateItem(
  id: string,
  updates: Partial<Omit<Item, "id" | "createdAt">>
): Promise<Item | undefined> {
  const existing = await getItem(id);
  if (!existing) return undefined;

  const oldFile = await findFileById(id);
  const updated = {
    ...existing,
    ...updates,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  } as Item;

  const newFilename = filenameForItem(updated);

  if (oldFile && oldFile !== newFilename) {
    await unlink(join(DATA_DIR, oldFile));
  }

  await writeFile(join(DATA_DIR, newFilename), serializeItem(updated), "utf-8");
  return updated;
}

export async function deleteItem(id: string): Promise<boolean> {
  const file = await findFileById(id);
  if (!file) return false;
  await unlink(join(DATA_DIR, file));
  return true;
}
