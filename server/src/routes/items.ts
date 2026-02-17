import { Router } from "express";
import type { Item, ItemFilters, ItemKind, TaskStatus } from "../../../shared/types.js";
import { listItems, getItem, createItem, updateItem, deleteItem } from "../services/itemStore.js";

const router = Router();

router.get("/", async (req, res) => {
  const filters: ItemFilters = {
    kind: req.query.kind as ItemKind | undefined,
    tag: req.query.tag as string | undefined,
    q: req.query.q as string | undefined,
    status: req.query.status as TaskStatus | undefined,
  };
  const items = await listItems(filters);
  res.json(items);
});

router.get("/:id", async (req, res) => {
  const item = await getItem(req.params.id);
  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  res.json(item);
});

router.post("/", async (req, res) => {
  const { kind, title, tags, body, status } = req.body;
  if (!kind || !title) {
    res.status(400).json({ error: "kind and title are required" });
    return;
  }
  const item = await createItem({ kind, title, tags: tags ?? [], body: body ?? "", status });
  res.status(201).json(item);
});

router.put("/:id", async (req, res) => {
  const updated = await updateItem(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const deleted = await deleteItem(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  res.status(204).send();
});

router.post("/:id/promote", async (req, res) => {
  const item = await getItem(req.params.id);
  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }
  if (item.kind !== "idea") {
    res.status(400).json({ error: "Only ideas can be promoted to tasks" });
    return;
  }
  const promoted = await updateItem(req.params.id, {
    kind: "task",
    status: "backlog",
  } as Partial<Omit<Item, "id" | "createdAt">>);
  res.json(promoted);
});

export default router;
