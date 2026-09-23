"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Trash2 } from "lucide-react";
import type { Feedback } from "@/lib/feedback";
import { splitFeedbackMessage } from "@/lib/admin/feedback-model";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";

function formatWhen(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function FeedbackList({ items, page, total, query, rating, sort, canDelete }: {
  items: Feedback[];
  page: number;
  total: number;
  query: string;
  rating: number | null;
  sort: "newest" | "oldest";
  canDelete: boolean;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(query);
  const [visible, setVisible] = useState(items);
  const [deleting, setDeleting] = useState<Feedback | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => setSearch(query), [query]);
  useEffect(() => setVisible(items), [items]);

  const navigate = (values: Record<string, string>) => {
    const next = new URLSearchParams({ q: query, rating: rating ? String(rating) : "", sort, page: String(page) });
    Object.entries(values).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    router.push(`/admin/feedback?${next.toString()}`);
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/feedback/${deleting.id}`, { method: "DELETE" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Could not delete feedback.");
      setVisible((current) => current.filter((item) => item.id !== deleting.id));
      setDeleting(null);
      setNotice("Feedback deleted.");
      router.refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not delete feedback.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <form onSubmit={(event) => { event.preventDefault(); navigate({ q: search.trim(), page: "1" }); }} className="mb-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
        <label className="relative min-w-0">
          <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted" />
          <span className="sr-only">Search feedback</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search feedback" className="h-11 w-full border border-border bg-[#141414] pl-10 pr-3 text-sm text-foreground outline-none focus:border-accent" />
        </label>
        <button type="submit" className="h-11 border border-border px-5 text-sm text-foreground hover:border-accent">Search</button>
        <select aria-label="Filter by rating" value={rating ?? ""} onChange={(event) => navigate({ rating: event.target.value, page: "1" })} className="h-11 border border-border bg-[#141414] px-3 text-sm text-foreground outline-none focus:border-accent">
          <option value="">All ratings</option>
          {[5,4,3,2,1].map((value) => <option key={value} value={value}>{value} stars</option>)}
        </select>
        <select aria-label="Sort feedback" value={sort} onChange={(event) => navigate({ sort: event.target.value, page: "1" })} className="h-11 border border-border bg-[#141414] px-3 text-sm text-foreground outline-none focus:border-accent">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </form>

      {notice && <p role="status" className="mb-4 border-l-2 border-accent px-3 text-sm text-foreground">{notice}</p>}
      {!visible.length ? (
        <div className="grid min-h-56 place-items-center border border-border bg-[#141414]/72 p-8 text-center">
          <div><p className="font-display text-2xl text-foreground">{query || rating ? "No matching feedback." : "No feedback yet."}</p><p className="mt-2 text-sm text-muted">{query || rating ? "Try a different search or rating." : "Messages from the public site will appear here."}</p></div>
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((item) => {
            const parsed = splitFeedbackMessage(item.message);
            return <li key={item.id} className="border border-border bg-[#141414]/72 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs uppercase tracking-[0.16em] text-accent">{parsed.kind}</span>
                  <span className="text-xs text-muted">{item.name || "Anonymous"}</span>
                  {item.rating != null && <span className="text-xs text-foreground">{item.rating}/5</span>}
                  {item.project && <span className="text-xs text-muted">{item.project}</span>}
                </div>
                {canDelete && <button type="button" aria-label="Delete feedback" onClick={() => setDeleting(item)} className="flex min-h-9 items-center gap-2 text-xs text-muted hover:text-accent"><Trash2 className="h-4 w-4" /> Delete</button>}
              </div>
              <p className="mt-5 whitespace-pre-wrap text-[0.95rem] font-light leading-relaxed text-foreground">{parsed.body || "Message unavailable."}</p>
              <p className="mt-5 text-xs text-muted">{formatWhen(item.createdAt)}</p>
            </li>;
          })}
        </ul>
      )}
      {total > 20 && <div className="mt-6 flex items-center justify-between gap-4 text-sm text-muted"><span>{total} messages · Page {page}</span><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => navigate({ page: String(page - 1) })} className="border border-border px-4 py-2 disabled:opacity-40">Previous</button><button type="button" disabled={page * 20 >= total} onClick={() => navigate({ page: String(page + 1) })} className="border border-border px-4 py-2 disabled:opacity-40">Next</button></div></div>}
      {deleting && <ConfirmDeleteDialog title="Delete this feedback?" description="This action permanently removes the message." busy={busy} onCancel={() => setDeleting(null)} onConfirm={remove} />}
    </>
  );
}
