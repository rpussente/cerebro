import { useState, useCallback } from "react";
import type { IdeaItem } from "../../../../shared/types.js";
import { listItems, createItem, updateItem, deleteItem, promoteItem } from "../../api/items.js";
import IdeaCard from "./IdeaCard.js";
import IdeaForm from "./IdeaForm.js";

function useIdeas() {
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const items = await listItems({ kind: "idea" });
      setIdeas(items.filter((i): i is IdeaItem => i.kind === "idea"));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load ideas");
    } finally {
      setLoaded(true);
    }
  }, []);

  if (!loaded) {
    refresh();
  }

  return { ideas, loaded, error, refresh };
}

export default function IdeaList() {
  const { ideas, loaded, error, refresh } = useIdeas();
  const [showForm, setShowForm] = useState(false);
  const [editingIdea, setEditingIdea] = useState<IdeaItem | null>(null);

  const handleSave = async (data: { title: string; body: string; tags: string[] }) => {
    try {
      if (editingIdea) {
        await updateItem(editingIdea.id, data);
      } else {
        await createItem({ kind: "idea", ...data });
      }
      setShowForm(false);
      setEditingIdea(null);
      await refresh();
    } catch (e) {
      console.error("Failed to save idea:", e);
    }
  };

  const handlePromote = async (id: string) => {
    try {
      await promoteItem(id);
      await refresh();
    } catch (e) {
      console.error("Failed to promote idea:", e);
    }
  };

  const handleEdit = (idea: IdeaItem) => {
    setEditingIdea(idea);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this idea?")) return;
    try {
      await deleteItem(id);
      await refresh();
    } catch (e) {
      console.error("Failed to delete idea:", e);
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingIdea(null);
  };

  if (!loaded) {
    return <p style={{ color: "#888" }}>Loading ideas...</p>;
  }

  if (error) {
    return <p style={{ color: "#c66" }}>Error: {error}</p>;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Ideas</h1>
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
          + New Idea
        </button>
      </div>
      {ideas.length === 0 && <p style={{ color: "#888" }}>No ideas yet. Capture one!</p>}
      {ideas.map((idea) => (
        <IdeaCard key={idea.id} idea={idea} onPromote={handlePromote} onEdit={handleEdit} onDelete={handleDelete} />
      ))}
      {showForm && (
        <IdeaForm
          key={editingIdea?.id ?? "new"}
          initial={editingIdea ? { title: editingIdea.title, body: editingIdea.body, tags: editingIdea.tags } : undefined}
          isEdit={!!editingIdea}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
