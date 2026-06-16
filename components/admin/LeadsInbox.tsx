"use client";

import { useMemo, useState } from "react";
import { Mail, Phone, Search } from "lucide-react";
import type {
  AppRole,
  LeadRow,
  LeadStatus,
} from "@/lib/supabase/database.types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { canEditLeads } from "@/lib/admin/permissions";
import { inr, shortDate } from "@/lib/admin/format";
import { cn } from "@/lib/cn";

const STATUSES: LeadStatus[] = ["new", "contacted", "converted", "lost"];

const STATUS_CLASS: Record<LeadStatus, string> = {
  new: "text-accent border-accent/35 bg-accent/10",
  contacted: "text-sky-200 border-sky-200/20 bg-sky-200/10",
  converted: "text-emerald-300 border-emerald-300/20 bg-emerald-300/10",
  lost: "text-muted border-border bg-foreground/[0.03]",
};

export function LeadsInbox({
  leads,
  role,
}: {
  leads: LeadRow[];
  role: AppRole;
}) {
  const [items, setItems] = useState(leads);
  const [selectedId, setSelectedId] = useState(leads[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [saving, setSaving] = useState("");
  const canEdit = canEditLeads(role);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((lead) => {
      const matchesStatus = status === "all" || lead.status === status;
      const haystack = [
        lead.name,
        lead.contact_email,
        lead.contact_phone,
        lead.persona,
        lead.stage,
        lead.brief_text,
        ...(lead.needs || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesStatus && (!q || haystack.includes(q));
    });
  }, [items, query, status]);

  const selected = items.find((lead) => lead.id === selectedId) || filtered[0];

  const updateStatus = async (lead: LeadRow, nextStatus: LeadStatus) => {
    if (!canEdit) return;
    setSaving(lead.id);
    const previous = items;
    setItems((current) =>
      current.map((item) =>
        item.id === lead.id ? { ...item, status: nextStatus } : item
      )
    );
    const { error } = await createSupabaseBrowserClient()
      .from("leads")
      .update({ status: nextStatus })
      .eq("id", lead.id);
    if (error) setItems(previous);
    setSaving("");
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
      <section className="rounded-lg border border-border bg-[#141414]/72">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, brief, persona..."
              className="h-11 w-full rounded-md border border-border bg-background/40 pl-10 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent"
            />
          </label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as LeadStatus | "all")}
            className="h-11 rounded-md border border-border bg-background/40 px-3 text-sm text-foreground outline-none focus:border-accent"
          >
            <option value="all">All status</option>
            {STATUSES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="text-[0.64rem] uppercase tracking-[0.2em] text-muted">
              <tr className="border-b border-border">
                <th className="px-4 py-3 font-medium">Lead</th>
                <th className="px-4 py-3 font-medium">Needs</th>
                <th className="px-4 py-3 font-medium">Persona</th>
                <th className="px-4 py-3 font-medium">Estimate</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => setSelectedId(lead.id)}
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-foreground/[0.035]",
                    selected?.id === lead.id && "bg-foreground/[0.045]"
                  )}
                >
                  <td className="px-4 py-4">
                    <p className="font-medium text-foreground">
                      {lead.name || lead.contact_email || "Unnamed lead"}
                    </p>
                    {lead.contact_email && (
                      <p className="mt-1 text-xs text-muted">{lead.contact_email}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-muted">
                    {(lead.needs || []).slice(0, 3).join(", ") || "-"}
                  </td>
                  <td className="px-4 py-4 text-muted">{lead.persona || "-"}</td>
                  <td className="px-4 py-4 text-foreground">
                    {lead.ai_price_low && lead.ai_price_high
                      ? `${inr(lead.ai_price_low)} - ${inr(lead.ai_price_high)}`
                      : "-"}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-xs",
                        STATUS_CLASS[lead.status]
                      )}
                    >
                      {saving === lead.id ? "saving" : lead.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-muted">{shortDate(lead.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!filtered.length && (
          <div className="grid min-h-56 place-items-center p-8 text-center">
            <div>
              <p className="font-display text-2xl text-foreground">no leads yet.</p>
              <p className="mt-2 text-sm text-muted">
                Once visitors complete the estimate step, they will land here.
              </p>
            </div>
          </div>
        )}
      </section>

      <aside className="rounded-lg border border-border bg-[#141414]/72 p-5 xl:sticky xl:top-24 xl:self-start">
        {selected ? (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Lead detail</p>
                <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
                  {selected.name || "Unnamed"}
                </h2>
              </div>
              <span
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs",
                  STATUS_CLASS[selected.status]
                )}
              >
                {selected.status}
              </span>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              {selected.contact_email && (
                <p className="flex items-center gap-2 text-foreground">
                  <Mail className="h-4 w-4 text-muted" />
                  {selected.contact_email}
                </p>
              )}
              {selected.contact_phone && (
                <p className="flex items-center gap-2 text-muted">
                  <Phone className="h-4 w-4" />
                  {selected.contact_phone}
                </p>
              )}
            </div>

            <div className="mt-7">
              <p className="eyebrow">Brief</p>
              <p className="mt-3 text-sm font-light leading-relaxed text-muted">
                {selected.brief_text || "No brief text captured."}
              </p>
            </div>

            <div className="mt-7">
              <p className="eyebrow">AI estimate</p>
              <p className="mt-3 font-display text-2xl font-semibold text-accent">
                {selected.ai_price_low && selected.ai_price_high
                  ? `${inr(selected.ai_price_low)} - ${inr(selected.ai_price_high)}`
                  : "-"}
              </p>
              <p className="mt-3 text-sm font-light leading-relaxed text-muted">
                {selected.ai_summary || "No estimate summary captured."}
              </p>
              {!!selected.ai_included?.length && (
                <ul className="mt-4 space-y-2 text-sm text-muted">
                  {selected.ai_included.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-7">
              <p className="eyebrow mb-3">Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    disabled={!canEdit}
                    onClick={() => updateStatus(selected, item)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-45",
                      selected.status === item
                        ? STATUS_CLASS[item]
                        : "border-border text-muted hover:border-accent/50 hover:text-foreground"
                    )}
                  >
                    {item}
                  </button>
                ))}
              </div>
              {!canEdit && (
                <p className="mt-3 text-xs text-muted/70">Viewer access is read-only.</p>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted">Select a lead to inspect it.</p>
        )}
      </aside>
    </div>
  );
}
