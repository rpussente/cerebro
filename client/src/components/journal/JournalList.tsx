import { useState, useCallback } from "react";
import type { JournalItem } from "../../../../shared/types.js";
import { listItems, createItem, updateItem, deleteItem } from "../../api/items.js";
import JournalEntry from "./JournalEntry.js";
import JournalEditor from "./JournalEditor.js";

function useJournal() {
  const [entries, setEntries] = useState<JournalItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (filters?: { q?: string; tag?: string }) => {
    try {
      const items = await listItems({ kind: "journal", ...filters });
      const journal = items
        .filter((i): i is JournalItem => i.kind === "journal")
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setEntries(journal);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load journal");
    } finally {
      setLoaded(true);
    }
  }, []);

  if (!loaded) {
    refresh();
  }

  return { entries, loaded, error, refresh };
}

export default function JournalList() {
  const { entries, loaded, error, refresh } = useJournal();
  const [showEditor, setShowEditor] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tagFilter, setTagFilter] = useState("");

  const buildFilters = (): { q?: string; tag?: string } => {
    const filters: { q?: string; tag?: string } = {};
    if (searchQuery.trim()) filters.q = searchQuery.trim();
    if (tagFilter.trim()) filters.tag = tagFilter.trim();
    return filters;
  };

  const handleSearch = async () => {
    await refresh(buildFilters());
  };

  const handleSave = async (data: { title: string; body: string; tags: string[] }) => {
    try {
      if (editingEntry) {
        await updateItem(editingEntry.id, data);
      } else {
        await createItem({ kind: "journal", ...data });
      }
      setShowEditor(false);
      setEditingEntry(null);
      await refresh(buildFilters());
    } catch (e) {
      console.error("Failed to save journal entry:", e);
    }
  };

  const handleEdit = (entry: JournalItem) => {
    setEditingEntry(entry);
    setShowEditor(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this journal entry?")) return;
    try {
      await deleteItem(id);
      await refresh(buildFilters());
    } catch (e) {
      console.error("Failed to delete journal entry:", e);
    }
  };

  const handleClose = () => {
    setShowEditor(false);
    setEditingEntry(null);
  };

  const allTags = [...new Set(entries.flatMap((e) => e.tags))].sort();

  if (!loaded) {
    return <p style={{ color: "#888" }}>Loading journal...</p>;
  }

  if (error) {
    return <p style={{ color: "#c66" }}>Error: {error}</p>;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Journal</h1>
        <button
          onClick={() => setShowEditor(true)}
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
          + New Entry
        </button>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search entries..."
          style={{
            flex: 1,
            padding: "0.4rem 0.6rem",
            background: "#0d0d1a",
            border: "1px solid #444",
            borderRadius: 4,
            color: "#eee",
            fontSize: "0.9rem",
          }}
        />
        <select
          value={tagFilter}
          onChange={(e) => {
            setTagFilter(e.target.value);
          }}
          style={{
            padding: "0.4rem 0.6rem",
            background: "#0d0d1a",
            border: "1px solid #444",
            borderRadius: 4,
            color: "#eee",
            fontSize: "0.9rem",
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
          onClick={handleSearch}
          style={{
            padding: "0.4rem 0.8rem",
            border: "1px solid #555",
            borderRadius: 4,
            background: "transparent",
            color: "#ccc",
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          Search
        </button>
      </div>
      {entries.length === 0 && <p style={{ color: "#888" }}>No journal entries yet. Start writing!</p>}
      {entries.map((entry) => (
        <JournalEntry key={entry.id} entry={entry} onEdit={handleEdit} onDelete={handleDelete} />
      ))}
      {showEditor && (
        <JournalEditor
          key={editingEntry?.id ?? "new"}
          initial={editingEntry ? { title: editingEntry.title, body: editingEntry.body, tags: editingEntry.tags } : undefined}
          isEdit={!!editingEntry}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
