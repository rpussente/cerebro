import type { Item, ItemKind, TaskItem, TaskStatus } from "../../../shared/types.js";

const BASE = "/api/items";

export interface ListFilters {
  kind?: ItemKind;
  tag?: string;
  q?: string;
  status?: TaskStatus;
}

function buildQuery(filters: ListFilters): string {
  const params = new URLSearchParams();
  if (filters.kind) params.set("kind", filters.kind);
  if (filters.tag) params.set("tag", filters.tag);
  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function listItems(filters: ListFilters = {}): Promise<Item[]> {
  const res = await fetch(`${BASE}${buildQuery(filters)}`);
  if (!res.ok) throw new Error(`Failed to list items: ${res.status}`);
  return res.json();
}

export async function getItem(id: string): Promise<Item> {
  const res = await fetch(`${BASE}/${id}`);
  if (!res.ok) throw new Error(`Failed to get item: ${res.status}`);
  return res.json();
}

export async function createItem(
  input: Pick<Item, "kind" | "title" | "tags" | "body"> & { status?: TaskStatus }
): Promise<Item> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to create item: ${res.status}`);
  return res.json();
}

export async function updateItem(
  id: string,
  updates: Partial<Omit<Item & TaskItem, "id" | "createdAt">>
): Promise<Item> {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(`Failed to update item: ${res.status}`);
  return res.json();
}

export async function deleteItem(id: string): Promise<void> {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete item: ${res.status}`);
}

export async function promoteItem(id: string): Promise<Item> {
  const res = await fetch(`${BASE}/${id}/promote`, { method: "POST" });
  if (!res.ok) throw new Error(`Failed to promote item: ${res.status}`);
  return res.json();
}

export async function delegateItem(id: string): Promise<Item> {
  const res = await fetch(`${BASE}/${id}/delegate`, { method: "POST" });
  if (!res.ok) throw new Error(`Failed to delegate item: ${res.status}`);
  return res.json();
}
