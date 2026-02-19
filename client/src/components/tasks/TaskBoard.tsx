import { useState, useCallback } from "react";
import type { TaskItem, TaskStatus } from "../../../../shared/types.js";
import { listItems, createItem, updateItem, deleteItem, delegateItem } from "../../api/items.js";
import { listTmuxSessions } from "../../api/tmux.js";
import TaskCard from "./TaskCard.js";
import TaskForm from "./TaskForm.js";

const columns: { status: TaskStatus; label: string }[] = [
  { status: "backlog", label: "Backlog" },
  { status: "delegated", label: "Delegated" },
  { status: "in-progress", label: "In Progress" },
  { status: "done", label: "Done" },
];

function useItems() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [activeSessions, setActiveSessions] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (filters?: { tag?: string }) => {
    try {
      const [items, sessions] = await Promise.all([
        listItems({ kind: "task", ...filters }),
        listTmuxSessions().catch(() => []),
      ]);
      setTasks(items.filter((i): i is TaskItem => i.kind === "task"));
      setActiveSessions(new Set(sessions.map((s) => s.name)));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load tasks");
    } finally {
      setLoaded(true);
    }
  }, []);

  if (!loaded) {
    refresh();
  }

  return { tasks, activeSessions, loaded, error, refresh };
}

export default function TaskBoard() {
  const { tasks, activeSessions, loaded, error, refresh } = useItems();
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [tagFilter, setTagFilter] = useState("");

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    try {
      await updateItem(id, { status });
      await refresh(buildFilters());
    } catch (e) {
      console.error("Failed to update task status:", e);
    }
  };

  const handleSave = async (data: { title: string; body: string; tags: string[] }) => {
    try {
      if (editingTask) {
        await updateItem(editingTask.id, data);
      } else {
        await createItem({ kind: "task", ...data });
      }
      setShowForm(false);
      setEditingTask(null);
      await refresh(buildFilters());
    } catch (e) {
      console.error("Failed to save task:", e);
    }
  };

  const handleEdit = (task: TaskItem) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    try {
      await deleteItem(id);
      await refresh(buildFilters());
    } catch (e) {
      console.error("Failed to delete task:", e);
    }
  };

  const handleDelegate = async (id: string) => {
    try {
      await delegateItem(id);
      await refresh(buildFilters());
    } catch (e) {
      console.error("Failed to delegate task:", e);
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const buildFilters = (): { tag?: string } => {
    const filters: { tag?: string } = {};
    if (tagFilter.trim()) filters.tag = tagFilter.trim();
    return filters;
  };

  const handleTagFilter = (tag: string) => {
    setTagFilter(tag);
    refresh(tag ? { tag } : undefined);
  };

  const allTags = [...new Set(tasks.flatMap((t) => t.tags))].sort();

  if (!loaded) {
    return <p style={{ color: "#888" }}>Loading tasks...</p>;
  }

  if (error) {
    return <p style={{ color: "#c66" }}>Error: {error}</p>;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Tasks</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select
            value={tagFilter}
            onChange={(e) => handleTagFilter(e.target.value)}
            style={{
              padding: "0.4rem 0.6rem",
              background: "#0d0d1a",
              border: "1px solid #444",
              borderRadius: 4,
              color: "#eee",
              fontSize: "0.85rem",
            }}
          >
            <option value="">All tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: "0.4rem 1rem",
              border: "none",
              borderRadius: 4,
              background: "#4a6cf7",
              color: "#fff",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            + New Task
          </button>
        </div>
      </div>
      <div style={{ display: "flex", gap: "1rem" }}>
        {columns.map((col) => (
          <div key={col.status} style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                fontSize: "0.9rem",
                textTransform: "uppercase",
                color: "#888",
                marginBottom: "0.5rem",
              }}
            >
              {col.label} ({tasks.filter((t) => t.status === col.status).length})
            </h3>
            {tasks
              .filter((t) => t.status === col.status)
              .map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  sessionActive={task.tmuxSession ? activeSessions.has(task.tmuxSession) : false}
                  onStatusChange={handleStatusChange}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onDelegate={handleDelegate}
                />
              ))}
          </div>
        ))}
      </div>
      {showForm && (
        <TaskForm
          key={editingTask?.id ?? "new"}
          initial={editingTask ? { title: editingTask.title, body: editingTask.body, tags: editingTask.tags } : undefined}
          isEdit={!!editingTask}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
