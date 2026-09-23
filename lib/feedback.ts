import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { FeedbackRow } from "@/lib/supabase/database.types";
import { normalizeFeedbackRow, type Feedback } from "@/lib/admin/feedback-model";

export type { Feedback } from "@/lib/admin/feedback-model";

function feedbackStore() {
  const client = getSupabaseAdminClient();
  if (!client) throw new Error("Feedback storage is not configured.");
  return client;
}

function toFeedback(row: FeedbackRow): Feedback {
  return normalizeFeedbackRow(row);
}

/** Public submissions are written server-side; the service key never reaches the browser. */
export async function createFeedback(message: string): Promise<Feedback> {
  const { data, error } = await feedbackStore()
    .from("feedback")
    .insert({ message })
    .select("id,message,created_at")
    .single();

  if (error) throw error;
  return toFeedback(data as FeedbackRow);
}
