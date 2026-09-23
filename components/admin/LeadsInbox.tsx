"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Phone, Search, Trash2 } from "lucide-react";
import type { AppRole, LeadRow, LeadStatus } from "@/lib/supabase/database.types";
import { canEditLeads } from "@/lib/admin/permissions";
import { inr, shortDate } from "@/lib/admin/format";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { cn } from "@/lib/cn";

const STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "proposal", "won", "converted", "lost"];
const STATUS_CLASS: Record<LeadStatus, string> = {
  new: "text-accent border-accent/35 bg-accent/10",
  contacted: "text-sky-200 border-sky-200/20 bg-sky-200/10",
  qualified: "text-amber-200 border-amber-200/20 bg-amber-200/10",
  proposal: "text-violet-200 border-violet-200/20 bg-violet-200/10",
  won: "text-emerald-300 border-emerald-300/20 bg-emerald-300/10",
  converted: "text-emerald-300 border-emerald-300/20 bg-emerald-300/10",
  lost: "text-muted border-border bg-foreground/[0.03]",
};

export function LeadsInbox({ leads, role, page, total, query, status, sort }: {
  leads: LeadRow[];
  role: AppRole;
  page: number;
  total: number;
  query: string;
  status: LeadStatus | "all";
  sort: "newest" | "oldest" | "updated";
}) {
  const router = useRouter();
  const [items, setItems] = useState(leads);
  const [selectedId, setSelectedId] = useState(leads[0]?.id ?? "");
  const [search, setSearch] = useState(query);
  const [saving, setSaving] = useState("");
  const [deleting, setDeleting] = useState<LeadRow | null>(null);
  const [notice, setNotice] = useState("");
  const canEdit = canEditLeads(role);
  const selected = items.find((lead) => lead.id === selectedId) || items[0];

  useEffect(() => {
    setItems(leads);
    setSelectedId(leads[0]?.id ?? "");
    setSearch(query);
  }, [leads, query]);

  const navigate = (values: Record<string, string>) => {
    const next = new URLSearchParams({ q: query, status: status === "all" ? "" : status, sort, page: String(page) });
    Object.entries(values).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    router.push(`/admin/leads?${next.toString()}`);
  };

  const updateStatus = async (lead: LeadRow, nextStatus: LeadStatus) => {
    if (!canEdit || saving) return;
    setSaving(lead.id);
    setNotice("");
    try {
      const response = await fetch(`/api/admin/leads/${lead.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Could not update lead.");
      setItems((current) => current.map((item) => item.id === lead.id ? { ...item, status: nextStatus, updated_at: body.lead.updated_at } : item));
      setNotice("Lead updated.");
      router.refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not update lead.");
    } finally { setSaving(""); }
  };

  const remove = async () => {
    if (!deleting) return;
    setSaving(deleting.id);
    try {
      const response = await fetch(`/api/admin/leads/${deleting.id}`, { method: "DELETE" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Could not delete lead.");
      setItems((current) => current.filter((item) => item.id !== deleting.id));
      setSelectedId("");
      setDeleting(null);
      setNotice("Lead deleted.");
      router.refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not delete lead.");
    } finally { setSaving(""); }
  };

  return <>
    <form onSubmit={(event) => { event.preventDefault(); navigate({ q: search.trim(), page: "1" }); }} className="mb-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
      <label className="relative min-w-0"><span className="sr-only">Search leads</span><Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, email, company or brief" className="h-11 w-full border border-border bg-[#141414] pl-10 pr-3 text-sm text-foreground outline-none focus:border-accent" /></label>
      <button type="submit" className="h-11 border border-border px-5 text-sm text-foreground hover:border-accent">Search</button>
      <select aria-label="Filter leads by status" value={status} onChange={(event) => navigate({ status: event.target.value === "all" ? "" : event.target.value, page: "1" })} className="h-11 border border-border bg-[#141414] px-3 text-sm text-foreground outline-none focus:border-accent"><option value="all">All statuses</option>{STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}</select>
      <select aria-label="Sort leads" value={sort} onChange={(event) => navigate({ sort: event.target.value, page: "1" })} className="h-11 border border-border bg-[#141414] px-3 text-sm text-foreground outline-none focus:border-accent"><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="updated">Recently updated</option></select>
    </form>
    {notice && <p role="status" className="mb-4 border-l-2 border-accent px-3 text-sm text-foreground">{notice}</p>}
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
      <section className="min-w-0 border border-border bg-[#141414]/72">
        {items.length ? <>
          <div className="hidden max-w-full overflow-x-auto md:block"><table className="w-full min-w-[750px] text-left text-sm"><thead className="text-[0.64rem] uppercase tracking-[0.2em] text-muted"><tr className="border-b border-border"><th className="px-4 py-3 font-medium">Lead</th><th className="px-4 py-3 font-medium">Project</th><th className="px-4 py-3 font-medium">Estimate</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Created</th></tr></thead><tbody className="divide-y divide-border">{items.map((lead) => <tr key={lead.id} onClick={() => setSelectedId(lead.id)} className={cn("cursor-pointer hover:bg-foreground/[0.035]", selected?.id === lead.id && "bg-foreground/[0.045]")}><td className="px-4 py-4"><p className="font-medium text-foreground">{lead.name || lead.contact_email || "Unnamed lead"}</p><p className="mt-1 text-xs text-muted">{lead.contact_email || "No email"}</p></td><td className="px-4 py-4 text-muted">{lead.company || lead.needs?.join(", ") || lead.persona || "—"}</td><td className="px-4 py-4 text-foreground">{lead.ai_price_low != null && lead.ai_price_high != null ? `${inr(lead.ai_price_low)}–${inr(lead.ai_price_high)}` : "—"}</td><td className="px-4 py-4"><span className={cn("border px-2.5 py-1 text-xs", STATUS_CLASS[lead.status] || STATUS_CLASS.new)}>{lead.status}</span></td><td className="px-4 py-4 text-muted">{shortDate(lead.created_at)}</td></tr>)}</tbody></table></div>
          <div className="divide-y divide-border md:hidden">{items.map((lead) => <button key={lead.id} type="button" onClick={() => setSelectedId(lead.id)} className={cn("w-full p-4 text-left", selected?.id === lead.id && "bg-foreground/[0.045]")}><span className="flex items-start justify-between gap-3"><span className="font-medium text-foreground">{lead.name || lead.contact_email || "Unnamed lead"}</span><span className="text-xs text-accent">{lead.status}</span></span><span className="mt-2 block text-xs text-muted">{lead.company || lead.needs?.join(", ") || "No project type"}</span><span className="mt-2 block text-xs text-muted">{shortDate(lead.created_at)}</span></button>)}</div>
        </> : <div className="grid min-h-56 place-items-center p-8 text-center"><div><p className="font-display text-2xl text-foreground">{query || status !== "all" ? "No matching leads." : "No leads yet."}</p><p className="mt-2 text-sm text-muted">{query || status !== "all" ? "Try a different search or filter." : "New enquiries will appear here."}</p></div></div>}
      </section>
      <aside className="min-w-0 border border-border bg-[#141414]/72 p-5 xl:sticky xl:top-24 xl:self-start">
        {selected ? <><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Lead detail</p><h2 className="mt-3 font-display text-3xl text-foreground">{selected.name || "Unnamed"}</h2></div><span className={cn("border px-2 py-1 text-xs", STATUS_CLASS[selected.status] || STATUS_CLASS.new)}>{selected.status}</span></div>
          <div className="mt-6 space-y-3 text-sm">{selected.contact_email && <p className="flex items-center gap-2 break-all text-foreground"><Mail className="h-4 w-4 shrink-0 text-muted" />{selected.contact_email}</p>}{selected.contact_phone && <p className="flex items-center gap-2 text-muted"><Phone className="h-4 w-4" />{selected.contact_phone}</p>}{selected.company && <p className="text-muted">Company: {selected.company}</p>}<p className="text-muted">Project: {selected.needs?.join(", ") || selected.persona || "Not specified"}</p><p className="text-muted">Created {shortDate(selected.created_at)} · Updated {shortDate(selected.updated_at || selected.created_at)}</p></div>
          <div className="mt-7"><p className="eyebrow">Brief</p><p className="mt-3 whitespace-pre-wrap text-sm font-light leading-relaxed text-muted">{selected.brief_text || "No brief captured."}</p></div>
          <div className="mt-7"><p className="eyebrow">Estimate</p><p className="mt-3 font-display text-2xl text-accent">{selected.ai_price_low != null && selected.ai_price_high != null ? `${inr(selected.ai_price_low)}–${inr(selected.ai_price_high)}` : "Not requested"}</p><p className="mt-3 text-sm leading-relaxed text-muted">{selected.ai_summary || "No estimate summary captured."}</p></div>
          <div className="mt-7"><label htmlFor="lead-status" className="eyebrow mb-3 block">Status</label><select id="lead-status" value={selected.status} disabled={!canEdit || saving === selected.id} onChange={(event) => updateStatus(selected, event.target.value as LeadStatus)} className="h-11 w-full border border-border bg-background px-3 text-sm text-foreground disabled:opacity-50">{STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}</select>{!canEdit && <p className="mt-2 text-xs text-muted">Viewer access is read-only.</p>}</div>
          {canEdit && <button type="button" onClick={() => setDeleting(selected)} className="mt-8 flex min-h-11 items-center gap-2 text-sm text-accent hover:text-accent/75"><Trash2 className="h-4 w-4" /> Delete lead</button>}
        </> : <p className="text-sm text-muted">Select a lead to inspect it.</p>}
      </aside>
    </div>
    {total > 25 && <div className="mt-6 flex items-center justify-between gap-4 text-sm text-muted"><span>{total} leads · Page {page}</span><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => navigate({ page: String(page - 1) })} className="border border-border px-4 py-2 disabled:opacity-40">Previous</button><button type="button" disabled={page * 25 >= total} onClick={() => navigate({ page: String(page + 1) })} className="border border-border px-4 py-2 disabled:opacity-40">Next</button></div></div>}
    {deleting && <ConfirmDeleteDialog title="Delete this lead?" description="This action permanently removes the lead and its associated data." busy={saving === deleting.id} onCancel={() => setDeleting(null)} onConfirm={remove} />}
  </>;
}
