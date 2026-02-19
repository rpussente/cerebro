import { useState } from "react";
import Markdown from "react-markdown";

interface Props {
  initial?: { title: string; body: string; tags: string[] };
  isEdit: boolean;
  onSave: (data: { title: string; body: string; tags: string[] }) => void;
  onClose: () => void;
}

export default function JournalEditor({ initial, isEdit, onSave, onClose }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [tagsInput, setTagsInput] = useState(initial?.tags.join(", ") ?? "");
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onSave({ title, body, tags });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#1a1a2e",
          border: "1px solid #444",
          borderRadius: 8,
          padding: "1.5rem",
          width: 600,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          overflow: "auto",
        }}
      >
        <h3 style={{ margin: 0 }}>{isEdit ? "Edit Entry" : "New Journal Entry"}</h3>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
          style={{
            padding: "0.5rem",
            background: "#0d0d1a",
            border: "1px solid #444",
            borderRadius: 4,
            color: "#eee",
          }}
        />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            style={{
              padding: "4px 10px",
              border: "1px solid #555",
              borderRadius: 4,
              background: showPreview ? "transparent" : "#333",
              color: "#ccc",
              cursor: "pointer",
              fontSize: "0.8rem",
            }}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            style={{
              padding: "4px 10px",
              border: "1px solid #555",
              borderRadius: 4,
              background: showPreview ? "#333" : "transparent",
              color: "#ccc",
              cursor: "pointer",
              fontSize: "0.8rem",
            }}
          >
            Preview
          </button>
        </div>
        {showPreview ? (
          <div
            style={{
              padding: "0.5rem",
              background: "#0d0d1a",
              border: "1px solid #444",
              borderRadius: 4,
              color: "#ccc",
              minHeight: 200,
              lineHeight: 1.6,
              fontSize: "0.9rem",
            }}
          >
            {body ? <Markdown>{body}</Markdown> : <span style={{ color: "#666" }}>Nothing to preview</span>}
          </div>
        ) : (
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your entry in markdown..."
            rows={10}
            style={{
              padding: "0.5rem",
              background: "#0d0d1a",
              border: "1px solid #444",
              borderRadius: 4,
              color: "#eee",
              resize: "vertical",
              fontFamily: "monospace",
              fontSize: "0.9rem",
              lineHeight: 1.5,
            }}
          />
        )}
        <input
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="Tags (comma-separated)"
          style={{
            padding: "0.5rem",
            background: "#0d0d1a",
            border: "1px solid #444",
            borderRadius: 4,
            color: "#eee",
          }}
        />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "0.4rem 1rem",
              border: "1px solid #555",
              borderRadius: 4,
              background: "transparent",
              color: "#ccc",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              padding: "0.4rem 1rem",
              border: "none",
              borderRadius: 4,
              background: "#4a6cf7",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            {isEdit ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
