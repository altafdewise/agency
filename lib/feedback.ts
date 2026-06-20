import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { FeedbackRow } from "@/lib/supabase/database.types";

export interface Feedback {
  id: string;
  message: string;
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const FEEDBACK_FILE = path.join(DATA_DIR, "feedback.json");

function isMissingFeedbackTable(error: { code?: string; message?: string }) {
  const message = error.message ?? "";
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    (/feedback/i.test(message) &&
      (/does not exist/i.test(message) || /schema cache/i.test(message)))
  );
}

function toFeedback(row: FeedbackRow): Feedback {
  return { id: row.id, message: row.message, createdAt: row.created_at };
}

async function createSupabaseFeedback(message: string) {
  const admin = getSupabaseAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .from("feedback")
    .insert({ message })
    .select("*")
    .single();

  if (error) {
    if (isMissingFeedbackTable(error)) return null;
    throw error;
  }

  return toFeedback(data as FeedbackRow);
}

async function listSupabaseFeedback() {
  const admin = getSupabaseAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .from("feedback")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingFeedbackTable(error)) return null;
    throw error;
  }

  return (data as FeedbackRow[]).map(toFeedback);
}

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(FEEDBACK_FILE);
  } catch {
    await fs.writeFile(FEEDBACK_FILE, "[]\n", "utf8");
  }
}

async function readFile(): Promise<Feedback[]> {
  await ensureStore();
  const raw = await fs.readFile(FEEDBACK_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as Feedback[]) : [];
  } catch {
    return [];
  }
}

async function writeFile(items: Feedback[]) {
  await ensureStore();
  await fs.writeFile(FEEDBACK_FILE, `${JSON.stringify(items, null, 2)}\n`, "utf8");
}

export async function createFeedback(message: string): Promise<Feedback> {
  const supabaseFeedback = await createSupabaseFeedback(message);
  if (supabaseFeedback) return supabaseFeedback;

  const items = await readFile();
  const feedback: Feedback = {
    id: randomUUID(),
    message,
    createdAt: new Date().toISOString(),
  };
  items.push(feedback);
  await writeFile(items);
  return feedback;
}

export async function listFeedback(): Promise<Feedback[]> {
  const supabaseFeedback = await listSupabaseFeedback();
  if (supabaseFeedback) return supabaseFeedback;

  const items = await readFile();
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
