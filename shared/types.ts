export interface BaseItem {
  id: string;
  kind: "task" | "idea" | "journal";
  title: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  body: string;
}

export interface TaskItem extends BaseItem {
  kind: "task";
  status: "backlog" | "delegated" | "in-progress" | "done";
  tmuxSession?: string;
}

export interface IdeaItem extends BaseItem {
  kind: "idea";
}

export interface JournalItem extends BaseItem {
  kind: "journal";
}

export type Item = TaskItem | IdeaItem | JournalItem;

export type ItemKind = Item["kind"];

export type TaskStatus = TaskItem["status"];

export interface ItemFilters {
  kind?: ItemKind;
  tag?: string;
  q?: string;
  status?: TaskStatus;
}
