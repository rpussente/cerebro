import { useState, useCallback } from "react";
import type { IdeaItem } from "../../../../shared/types.js";
import { listItems, createItem, updateItem, deleteItem, promoteItem } from "../../api/items.js";
import IdeaCard from "./IdeaCard.js";
import IdeaForm from "./IdeaForm.js";

function useIdeas() {
  const [ideas, setIdeas] = useState<IdeaItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (filters?: { tag?: string }) => {
    try {
      const items = await listItems({ kind: "idea", ...filters });
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
  const [tagFilter, setTagFilter] = useState("");

  const buildFilters = (): { tag?: string } => {
    const filters: { tag?: string } = {};
    if (tagFilter.trim()) filters.tag = tagFilter.trim();
    return filters;
  };

  const handleTagFilter = (tag: string) => {
    setTagFilter(tag);
    refresh(tag ? { tag } : undefined);
  };

  const handleSave = async (data: { title: string; body: string; tags: string[] }) => {
    try {
      if (editingIdea) {
        await updateItem(editingIdea.id, data);
      } else {
        await createItem({ kind: "idea", ...data });
      }
      setShowForm(false);
      setEditingIdea(null);
      await refresh(buildFilters());
    } catch (e) {
      console.error("Failed to save idea:", e);
    }
  };

  const handlePromote = async (id: string) => {
    try {
      await promoteItem(id);
      await refresh(buildFilters());
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
      await refresh(buildFilters());
    } catch (e) {
      console.error("Failed to delete idea:", e);
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingIdea(null);
  };

  const allTags = [...new Set(ideas.flatMap((i) => i.tags))].sort();

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
            + New Idea
          </button>
        </div>
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
