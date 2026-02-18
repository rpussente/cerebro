import type { IdeaItem } from "../../../../shared/types.js";

interface Props {
  idea: IdeaItem;
  onPromote: (id: string) => void;
  onEdit: (idea: IdeaItem) => void;
  onDelete: (id: string) => void;
}

export default function IdeaCard({ idea, onPromote, onEdit, onDelete }: Props) {
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
      <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{idea.title}</div>
      {idea.body && (
        <div style={{ fontSize: "0.85rem", color: "#aaa", marginBottom: "0.5rem" }}>
          {idea.body.slice(0, 200)}
          {idea.body.length > 200 ? "..." : ""}
        </div>
      )}
      {idea.tags.length > 0 && (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: "0.5rem" }}>
          {idea.tags.map((tag) => (
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
      <div style={{ display: "flex", gap: 4 }}>
        <button
          onClick={() => onPromote(idea.id)}
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
          Promote to Task
        </button>
        <button
          onClick={() => onEdit(idea)}
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
          onClick={() => onDelete(idea.id)}
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
