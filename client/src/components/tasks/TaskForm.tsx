import { useState } from "react";

interface Props {
  initial?: { title: string; body: string; tags: string[] };
  isEdit: boolean;
  onSave: (data: { title: string; body: string; tags: string[] }) => void;
  onClose: () => void;
}

export default function TaskForm({ initial, isEdit, onSave, onClose }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [tagsInput, setTagsInput] = useState(initial?.tags.join(", ") ?? "");

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
          width: 400,
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <h3 style={{ margin: 0 }}>{isEdit ? "Edit Task" : "New Task"}</h3>
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
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Description (markdown)"
          rows={5}
          style={{
            padding: "0.5rem",
            background: "#0d0d1a",
            border: "1px solid #444",
            borderRadius: 4,
            color: "#eee",
            resize: "vertical",
          }}
        />
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
