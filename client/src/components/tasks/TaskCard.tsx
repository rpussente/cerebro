import type { TaskItem, TaskStatus } from "../../../../shared/types.js";

interface Props {
  task: TaskItem;
  sessionActive: boolean;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (id: string) => void;
  onDelegate: (id: string) => void;
}

const statusTransitions: Record<TaskStatus, TaskStatus[]> = {
  backlog: ["in-progress"],
  delegated: ["in-progress", "done"],
  "in-progress": ["done", "backlog"],
  done: ["backlog"],
};

export default function TaskCard({ task, sessionActive, onStatusChange, onEdit, onDelete, onDelegate }: Props) {
  const canDelegate = task.status === "backlog";

  return (
    <div
      style={{
        border: "1px solid #444",
        borderRadius: 8,
        padding: "0.75rem",
        marginBottom: "0.5rem",
        background: "#1a1a2e",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{task.title}</div>
      {task.tmuxSession && (
        <div style={{ fontSize: "0.75rem", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: sessionActive ? "#4c4" : "#844",
            }}
          />
          <span style={{ color: sessionActive ? "#8c8" : "#c88" }}>
            {task.tmuxSession} ({sessionActive ? "running" : "stopped"})
          </span>
        </div>
      )}
      {task.body && (
        <div style={{ fontSize: "0.85rem", color: "#aaa", marginBottom: "0.5rem" }}>
          {task.body.slice(0, 120)}
          {task.body.length > 120 ? "..." : ""}
        </div>
      )}
      {task.tags.length > 0 && (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: "0.5rem" }}>
          {task.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: "0.75rem",
                background: "#333",
                padding: "2px 6px",
                borderRadius: 4,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {canDelegate && (
          <button
            onClick={() => onDelegate(task.id)}
            style={{
              fontSize: "0.75rem",
              padding: "2px 8px",
              border: "1px solid #585",
              borderRadius: 4,
              background: "transparent",
              color: "#8c8",
              cursor: "pointer",
            }}
          >
            Delegate
          </button>
        )}
        {statusTransitions[task.status].map((s) => (
          <button
            key={s}
            onClick={() => onStatusChange(task.id, s)}
            style={{
              fontSize: "0.75rem",
              padding: "2px 8px",
              border: "1px solid #555",
              borderRadius: 4,
              background: "transparent",
              color: "#ccc",
              cursor: "pointer",
            }}
          >
            → {s}
          </button>
        ))}
        <button
          onClick={() => onEdit(task)}
          style={{
            fontSize: "0.75rem",
            padding: "2px 8px",
            border: "1px solid #555",
            borderRadius: 4,
            background: "transparent",
            color: "#ccc",
            cursor: "pointer",
          }}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(task.id)}
          style={{
            fontSize: "0.75rem",
            padding: "2px 8px",
            border: "1px solid #833",
            borderRadius: 4,
            background: "transparent",
            color: "#c66",
            cursor: "pointer",
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
