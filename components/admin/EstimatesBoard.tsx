"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AppRole, EstimateStatus, LeadRow } from "@/lib/supabase/database.types";
import { canEditLeads } from "@/lib/admin/permissions";
import { inr, shortDate } from "@/lib/admin/format";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";

const STATUSES: EstimateStatus[] = ["new", "reviewing", "sent", "accepted", "rejected"];

export function EstimatesBoard({ estimates, role, query, status, sort, page, total }: {
  estimates: LeadRow[]; role: AppRole; query: string; status: EstimateStatus | "all";
  sort: "newest" | "oldest"; page: number; total: number;
}) {
  const router = useRouter();
  const [items, setItems] = useState(estimates);
  const [selectedId, setSelectedId] = useState(estimates[0]?.id ?? "");
  const [search, setSearch] = useState(query);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<LeadRow | null>(null);
  const [notice, setNotice] = useState("");
  const canEdit = canEditLeads(role);
  const selected = items.find((item) => item.id === selectedId) || items[0];

  useEffect(() => { setItems(estimates); setSelectedId(estimates[0]?.id ?? ""); setSearch(query); }, [estimates, query]);

  const navigate = (values: Record<string, string>) => {
    const next = new URLSearchParams({ q: query, status: status === "all" ? "" : status, sort, page: String(page) });
    Object.entries(values).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    router.push(`/admin/estimates?${next.toString()}`);
  };

  const update = async (item: LeadRow, estimateStatus: EstimateStatus) => {
    if (!canEdit || busy) return;
    setBusy(true); setNotice("");
    try {
      const response = await fetch(`/api/admin/leads/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ estimateStatus }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Could not update estimate.");
      setItems((current) => current.map((row) => row.id === item.id ? { ...row, estimate_status: estimateStatus, updated_at: body.lead.updated_at } : row));
      setNotice("Estimate updated."); router.refresh();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not update estimate."); }
    finally { setBusy(false); }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/estimates/${deleting.id}`, { method: "DELETE" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Could not delete estimate.");
      setItems((current) => current.filter((item) => item.id !== deleting.id));
      setSelectedId(""); setDeleting(null); setNotice("Estimate deleted. The lead remains in the inbox."); router.refresh();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not delete estimate."); }
    finally { setBusy(false); }
  };

  return <>
    <form onSubmit={(event) => { event.preventDefault(); navigate({ q: search.trim(), page: "1" }); }} className="mb-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
      <input aria-label="Search estimates" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search client, email or project" className="h-11 min-w-0 border border-border bg-[#141414] px-3 text-sm text-foreground outline-none focus:border-accent" />
      <button type="submit" className="h-11 border border-border px-5 text-sm text-foreground hover:border-accent">Search</button>
      <select aria-label="Filter estimate status" value={status} onChange={(event) => navigate({ status: event.target.value === "all" ? "" : event.target.value, page: "1" })} className="h-11 border border-border bg-[#141414] px-3 text-sm text-foreground"><option value="all">All statuses</option>{STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}</select>
      <select aria-label="Sort estimates" value={sort} onChange={(event) => navigate({ sort: event.target.value, page: "1" })} className="h-11 border border-border bg-[#141414] px-3 text-sm text-foreground"><option value="newest">Newest first</option><option value="oldest">Oldest first</option></select>
    </form>
    {notice && <p role="status" className="mb-4 border-l-2 border-accent px-3 text-sm text-foreground">{notice}</p>}
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
      <section className="min-w-0 border border-border bg-[#141414]/72">
        {!items.length ? <div className="grid min-h-56 place-items-center p-8 text-center"><div><p className="font-display text-2xl text-foreground">{query || status !== "all" ? "No matching estimates." : "No estimates yet."}</p><p className="mt-2 text-sm text-muted">Estimate requests from the public site will appear here.</p></div></div> : <div className="divide-y divide-border">{items.map((item) => <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={`grid w-full gap-2 p-4 text-left hover:bg-foreground/[0.04] sm:grid-cols-[1fr_auto] ${selected?.id === item.id ? "bg-foreground/[0.045]" : ""}`}><div><p className="font-medium text-foreground">{item.name || item.contact_email || "Unnamed client"}</p><p className="mt-1 text-xs text-muted">{item.contact_email || "No email"} · {item.needs?.join(", ") || "Project unspecified"}</p></div><div className="sm:text-right"><p className="text-sm text-foreground">{item.ai_price_low != null && item.ai_price_high != null ? `${inr(item.ai_price_low)}–${inr(item.ai_price_high)}` : "Budget unavailable"}</p><p className="mt-1 text-xs text-muted">{item.estimate_status || "new"} · {shortDate(item.created_at)}</p></div></button>)}</div>}
      </section>
      <aside className="min-w-0 border border-border bg-[#141414]/72 p-5 xl:sticky xl:top-24 xl:self-start">{selected ? <><p className="eyebrow">Estimate detail</p><h2 className="mt-3 font-display text-3xl text-foreground">{selected.name || selected.contact_email || "Unnamed client"}</h2><p className="mt-3 break-all text-sm text-muted">{selected.contact_email || "No email recorded"}</p><dl className="mt-7 space-y-4 text-sm"><div><dt className="eyebrow">Project</dt><dd className="mt-2 text-foreground">{selected.needs?.join(", ") || selected.brief_text || "Not specified"}</dd></div><div><dt className="eyebrow">Estimated budget</dt><dd className="mt-2 text-xl text-accent">{selected.ai_price_low != null && selected.ai_price_high != null ? `${inr(selected.ai_price_low)}–${inr(selected.ai_price_high)}` : "Not recorded"}</dd></div><div><dt className="eyebrow">Timeline</dt><dd className="mt-2 text-foreground">{selected.ai_timeline || "Not recorded"}</dd></div><div><dt className="eyebrow">Created</dt><dd className="mt-2 text-foreground">{shortDate(selected.created_at)}</dd></div></dl><p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-muted">{selected.ai_summary || "No summary recorded."}</p><label htmlFor="estimate-status" className="eyebrow mb-3 mt-7 block">Status</label><select id="estimate-status" value={selected.estimate_status || "new"} disabled={!canEdit || busy} onChange={(event) => update(selected, event.target.value as EstimateStatus)} className="h-11 w-full border border-border bg-background px-3 text-sm text-foreground disabled:opacity-50">{STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}</select>{canEdit && <button type="button" onClick={() => setDeleting(selected)} className="mt-8 text-sm text-accent hover:text-accent/75">Delete estimate and linked lead</button>}</> : <p className="text-sm text-muted">Select an estimate to inspect it.</p>}</aside>
    </div>
    {total > 25 && <div className="mt-6 flex items-center justify-between gap-4 text-sm text-muted"><span>{total} estimates · Page {page}</span><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => navigate({ page: String(page - 1) })} className="border border-border px-4 py-2 disabled:opacity-40">Previous</button><button type="button" disabled={page * 25 >= total} onClick={() => navigate({ page: String(page + 1) })} className="border border-border px-4 py-2 disabled:opacity-40">Next</button></div></div>}
    {deleting && <ConfirmDeleteDialog title="Delete this estimate?" description="This action permanently removes the estimate. The original lead will remain in the inbox." busy={busy} onCancel={() => setDeleting(null)} onConfirm={remove} />}
  </>;
}
