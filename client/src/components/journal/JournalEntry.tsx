import Markdown from "react-markdown";
import type { JournalItem } from "../../../../shared/types.js";

interface Props {
  entry: JournalItem;
  onEdit: (entry: JournalItem) => void;
  onDelete: (id: string) => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function JournalEntry({ entry, onEdit, onDelete }: Props) {
  return (
    <div
      style={{
        border: "1px solid #444",
        borderRadius: 8,
        padding: "0.75rem",
        marginBottom: "0.75rem",
        background: "#1a1a2e",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.25rem" }}>
        <div style={{ fontWeight: 600 }}>{entry.title}</div>
        <div style={{ fontSize: "0.8rem", color: "#888" }}>{formatDate(entry.createdAt)}</div>
      </div>
      {entry.tags.length > 0 && (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: "0.5rem" }}>
          {entry.tags.map((tag) => (
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
      {entry.body && (
        <div style={{ fontSize: "0.9rem", color: "#ccc", lineHeight: 1.6, marginBottom: "0.5rem" }}>
          <Markdown>{entry.body}</Markdown>
        </div>
      )}
      <div style={{ display: "flex", gap: 4 }}>
        <button
          onClick={() => onEdit(entry)}
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
          onClick={() => onDelete(entry.id)}
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
