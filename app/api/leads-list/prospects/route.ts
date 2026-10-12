import { NextResponse } from "next/server";
import { hasLeadsSession } from "@/lib/leads-list/auth";
import { normalizeInput, normalizePatch, type Prospect } from "@/lib/leads-list/model";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMPORT = 500;

async function guard() {
  if (!(await hasLeadsSession())) {
    return NextResponse.json({ error: "Sign in with the passcode first." }, { status: 401 });
  }
  const supabase = getSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: "The database isn't configured." }, { status: 503 });
  return supabase;
}

function dbError(error: { code?: string; message?: string }) {
  // 42P01: the table doesn't exist yet (migration not run).
  if (error.code === "42P01") {
    return NextResponse.json({ error: "The prospects table hasn't been created yet. Run the migration in Supabase." }, { status: 503 });
  }
  console.error("[leads-list]", error);
  return NextResponse.json({ error: "The database didn't respond. Try again." }, { status: 500 });
}

/** The whole list for one city (the desk filters on the client). */
export async function GET(request: Request) {
  const supabase = await guard();
  if (supabase instanceof NextResponse) return supabase;

  const city = new URL(request.url).searchParams.get("city")?.trim();
  const rows: Prospect[] = [];
  const page = 1000;
  for (let from = 0; ; from += page) {
    let q = supabase.from("prospects").select("*").order("created_at", { ascending: false }).range(from, from + page - 1);
    if (city) q = q.eq("city", city);
    const { data, error } = await q;
    if (error) return dbError(error);
    rows.push(...((data ?? []) as unknown as Prospect[]));
    if (!data || data.length < page) break;
  }

  const { data: cities } = await supabase.from("prospects").select("city").limit(5000);
  const cityNames = [...new Set(((cities ?? []) as { city: string }[]).map((c) => c.city))].sort();
  return NextResponse.json({ rows, cities: cityNames });
}

/** Add one entry (object) or many (array). Duplicate numbers are skipped, not errors. */
export async function POST(request: Request) {
  const supabase = await guard();
  if (supabase instanceof NextResponse) return supabase;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send the entry as JSON." }, { status: 400 });
  }
  const items = Array.isArray(body) ? body : [body];
  if (!items.length) return NextResponse.json({ error: "Nothing to add." }, { status: 400 });
  if (items.length > MAX_IMPORT) {
    return NextResponse.json({ error: `Import at most ${MAX_IMPORT} at a time.` }, { status: 400 });
  }

  const rows = [];
  const problems: string[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    const result = normalizeInput(item);
    if ("error" in result) {
      problems.push(result.error);
      continue;
    }
    const key = `${result.row.city}:${result.row.phone_key}`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push(result.row);
  }
  if (!rows.length) return NextResponse.json({ error: problems[0] ?? "Nothing valid to add." }, { status: 400 });

  // Skip numbers already on the list for that city.
  const { data: existing, error: lookupError } = await supabase
    .from("prospects")
    .select("city,phone_key")
    .in("phone_key", rows.map((r) => r.phone_key));
  if (lookupError) return dbError(lookupError);
  const have = new Set(((existing ?? []) as { city: string; phone_key: string }[]).map((e) => `${e.city}:${e.phone_key}`));
  const fresh = rows.filter((r) => !have.has(`${r.city}:${r.phone_key}`));
  const skipped = rows.length - fresh.length;

  if (!fresh.length) {
    return NextResponse.json({ added: [], skipped, problems, error: items.length === 1 ? "That number is already on the list." : undefined });
  }

  const { data, error } = await supabase.from("prospects").insert(fresh).select("*");
  if (error) return dbError(error);
  return NextResponse.json({ added: data ?? [], skipped, problems });
}

/** Log a call outcome, a note, a follow-up date, or a correction. */
export async function PATCH(request: Request) {
  const supabase = await guard();
  if (supabase instanceof NextResponse) return supabase;

  let body: { id?: unknown } & Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send the update as JSON." }, { status: 400 });
  }
  const id = typeof body.id === "string" ? body.id : "";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Which entry?" }, { status: 400 });

  const result = normalizePatch(body);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });

  const patch: Record<string, unknown> = { ...result.patch, updated_at: new Date().toISOString() };
  if (body.logCall === true) {
    const { data: current } = await supabase.from("prospects").select("attempts").eq("id", id).maybeSingle();
    patch.attempts = ((current as { attempts?: number } | null)?.attempts ?? 0) + 1;
  }

  const { data, error } = await supabase.from("prospects").update(patch).eq("id", id).select("*").maybeSingle();
  if (error) return dbError(error);
  if (!data) return NextResponse.json({ error: "That entry no longer exists." }, { status: 404 });
  return NextResponse.json({ row: data });
}

export async function DELETE(request: Request) {
  const supabase = await guard();
  if (supabase instanceof NextResponse) return supabase;
  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Which entry?" }, { status: 400 });
  const { error } = await supabase.from("prospects").delete().eq("id", id);
  if (error) return dbError(error);
  return NextResponse.json({ ok: true });
}
