"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AppRole, BookingRow, BookingStatus, Json } from "@/lib/supabase/database.types";
import { canEditLeads } from "@/lib/admin/permissions";
import { shortDate } from "@/lib/admin/format";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";

const STATUSES: BookingStatus[] = ["pending", "confirmed", "cancelled"];

function service(brief: Json) {
  if (!brief || typeof brief !== "object" || Array.isArray(brief)) return "Service not specified";
  const needs = brief.needs;
  return Array.isArray(needs) ? needs.filter((value): value is string => typeof value === "string").join(", ") || "Service not specified" : "Service not specified";
}

export function BookingsBoard({ bookings, role, query, status, period, page, total, today }: {
  bookings: BookingRow[]; role: AppRole; query: string; status: BookingStatus | "all";
  period: "all" | "upcoming" | "completed"; page: number; total: number; today: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState(bookings);
  const [selectedId, setSelectedId] = useState(bookings[0]?.id ?? "");
  const [search, setSearch] = useState(query);
  const [date, setDate] = useState(bookings[0]?.date ?? "");
  const [time, setTime] = useState(bookings[0]?.time ?? "");
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<BookingRow | null>(null);
  const [notice, setNotice] = useState("");
  const canEdit = canEditLeads(role);
  const selected = items.find((item) => item.id === selectedId) || items[0];

  useEffect(() => { setItems(bookings); setSelectedId(bookings[0]?.id ?? ""); setSearch(query); }, [bookings, query]);
  useEffect(() => { setDate(selected?.date ?? ""); setTime(selected?.time ?? ""); }, [selected?.id, selected?.date, selected?.time]);

  const navigate = (values: Record<string, string>) => {
    const next = new URLSearchParams({ q: query, status: status === "all" ? "" : status, period: period === "all" ? "" : period, page: String(page) });
    Object.entries(values).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    router.push(`/admin/bookings?${next.toString()}`);
  };

  const update = async (item: BookingRow, changes: { status?: BookingStatus; date?: string; time?: string }, success: string) => {
    if (!canEdit || busy) return;
    setBusy(true); setNotice("");
    try {
      const response = await fetch(`/api/admin/bookings/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(changes) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Could not update booking.");
      setItems((current) => current.map((row) => row.id === item.id ? { ...row, ...body.booking } : row));
      setNotice(success); router.refresh();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not update booking."); }
    finally { setBusy(false); }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/bookings/${deleting.id}`, { method: "DELETE" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Could not delete booking.");
      setItems((current) => current.filter((item) => item.id !== deleting.id)); setSelectedId(""); setDeleting(null); setNotice("Booking deleted."); router.refresh();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not delete booking."); }
    finally { setBusy(false); }
  };

  return <>
    <form onSubmit={(event) => { event.preventDefault(); navigate({ q: search.trim(), page: "1" }); }} className="mb-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto_auto]">
      <input aria-label="Search bookings" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search client, email or note" className="h-11 min-w-0 border border-border bg-[#141414] px-3 text-sm text-foreground outline-none focus:border-accent" />
      <button type="submit" className="h-11 border border-border px-5 text-sm text-foreground hover:border-accent">Search</button>
      <select aria-label="Filter booking period" value={period} onChange={(event) => navigate({ period: event.target.value === "all" ? "" : event.target.value, page: "1" })} className="h-11 border border-border bg-[#141414] px-3 text-sm text-foreground"><option value="all">All dates</option><option value="upcoming">Upcoming</option><option value="completed">Completed</option></select>
      <select aria-label="Filter booking status" value={status} onChange={(event) => navigate({ status: event.target.value === "all" ? "" : event.target.value, page: "1" })} className="h-11 border border-border bg-[#141414] px-3 text-sm text-foreground"><option value="all">All statuses</option>{STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}</select>
    </form>
    {notice && <p role="status" className="mb-4 border-l-2 border-accent px-3 text-sm text-foreground">{notice}</p>}
    <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_370px]">
      <section className="min-w-0 border border-border bg-[#141414]/72">{!items.length ? <div className="grid min-h-56 place-items-center p-8 text-center"><div><p className="font-display text-2xl text-foreground">{query || period !== "all" || status !== "all" ? "No matching bookings." : "No bookings yet."}</p><p className="mt-2 text-sm text-muted">Booked calls from the public site will appear here.</p></div></div> : <div className="divide-y divide-border">{items.map((item) => <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={`grid w-full gap-2 p-4 text-left hover:bg-foreground/[0.04] sm:grid-cols-[1fr_auto] ${selected?.id === item.id ? "bg-foreground/[0.045]" : ""}`}><div><p className="font-medium text-foreground">{item.contact_name || item.contact_email}</p><p className="mt-1 text-xs text-muted">{item.contact_email} · {service(item.brief)}</p></div><div className="sm:text-right"><p className="text-sm text-foreground">{item.date} · {item.time}</p><p className="mt-1 text-xs text-muted">{item.status} · {item.date < today ? "completed" : "upcoming"}</p></div></button>)}</div>}</section>
      <aside className="min-w-0 border border-border bg-[#141414]/72 p-5 xl:sticky xl:top-24 xl:self-start">{selected ? <><p className="eyebrow">Booking detail</p><h2 className="mt-3 font-display text-3xl text-foreground">{selected.contact_name || "Unnamed client"}</h2><p className="mt-3 break-all text-sm text-muted">{selected.contact_email}</p>{selected.contact_phone && <p className="mt-2 text-sm text-muted">{selected.contact_phone}</p>}<dl className="mt-7 space-y-4 text-sm"><div><dt className="eyebrow">Call</dt><dd className="mt-2 text-foreground">{selected.date} at {selected.time} {selected.timezone}</dd></div><div><dt className="eyebrow">Service</dt><dd className="mt-2 text-foreground">{service(selected.brief)}</dd></div><div><dt className="eyebrow">Created</dt><dd className="mt-2 text-foreground">{shortDate(selected.created_at)}</dd></div>{selected.note && <div><dt className="eyebrow">Note</dt><dd className="mt-2 whitespace-pre-wrap text-foreground">{selected.note}</dd></div>}</dl>{canEdit && <><div className="mt-7"><label htmlFor="booking-status" className="eyebrow mb-3 block">Status</label><select id="booking-status" value={selected.status} disabled={busy} onChange={(event) => update(selected, { status: event.target.value as BookingStatus }, "Booking updated.")} className="h-11 w-full border border-border bg-background px-3 text-sm text-foreground disabled:opacity-50">{STATUSES.map((item) => <option key={item} value={item}>{item}</option>)}</select></div><form onSubmit={(event) => { event.preventDefault(); update(selected, { date, time }, "Booking rescheduled. Please notify the client of the new time."); }} className="mt-7"><p className="eyebrow">Reschedule</p><div className="mt-3 grid grid-cols-2 gap-2"><label className="text-xs text-muted">Date<input type="date" required value={date} onChange={(event) => setDate(event.target.value)} className="mt-2 h-11 w-full min-w-0 border border-border bg-background px-2 text-sm text-foreground" /></label><label className="text-xs text-muted">Time<input type="time" required value={time} onChange={(event) => setTime(event.target.value)} className="mt-2 h-11 w-full min-w-0 border border-border bg-background px-2 text-sm text-foreground" /></label></div><button type="submit" disabled={busy || (date === selected.date && time === selected.time)} className="mt-3 min-h-10 border border-border px-4 text-sm text-foreground disabled:opacity-40">Save new time</button></form><button type="button" onClick={() => setDeleting(selected)} className="mt-8 text-sm text-accent hover:text-accent/75">Delete booking</button></>}</> : <p className="text-sm text-muted">Select a booking to inspect it.</p>}</aside>
    </div>
    {total > 25 && <div className="mt-6 flex items-center justify-between gap-4 text-sm text-muted"><span>{total} bookings · Page {page}</span><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => navigate({ page: String(page - 1) })} className="border border-border px-4 py-2 disabled:opacity-40">Previous</button><button type="button" disabled={page * 25 >= total} onClick={() => navigate({ page: String(page + 1) })} className="border border-border px-4 py-2 disabled:opacity-40">Next</button></div></div>}
    {deleting && <ConfirmDeleteDialog title="Delete this booking?" description="This action permanently removes the booking and its stored contact and project details." busy={busy} onCancel={() => setDeleting(null)} onConfirm={remove} />}
  </>;
}
