export interface Feedback {
  id: string;
  message: string;
  createdAt: string;
  name: string | null;
  rating: number | null;
  project: string | null;
}

type FeedbackInput = {
  id?: unknown;
  message?: unknown;
  created_at?: unknown;
  name?: unknown;
  rating?: unknown;
  project?: unknown;
};

export function normalizeFeedbackRow(row: FeedbackInput): Feedback {
  return {
    id: typeof row.id === "string" ? row.id : "",
    message: typeof row.message === "string" ? row.message : "",
    createdAt: typeof row.created_at === "string" ? row.created_at : "",
    name: typeof row.name === "string" && row.name.trim() ? row.name : null,
    rating: typeof row.rating === "number" && Number.isInteger(row.rating) && row.rating >= 1 && row.rating <= 5 ? row.rating : null,
    project: typeof row.project === "string" && row.project.trim() ? row.project : null,
  };
}

export function splitFeedbackMessage(message: string) {
  const match = message.match(/^\[([^\]]+)]\n([\s\S]*)$/);
  return match ? { kind: match[1], body: match[2].trim() } : { kind: "Note", body: message };
}
