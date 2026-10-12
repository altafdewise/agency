"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, MapPin, MessageCircle, Phone, ExternalLink } from "lucide-react";
import {
  CATEGORIES,
  NEEDS,
  OUTCOMES,
  STATUSES,
  WEBSITE_STATUS,
  phoneKey,
  type Category,
  type Need,
  type Prospect,
  type Status,
  type WebsiteStatus,
} from "@/lib/leads-list/model";
import { NICHES } from "@/lib/niches";
import { sessionGet, sessionSet } from "@/lib/safe-storage";

/* ── Helpers ────────────────────────────────────────────────────────────── */

const DAILY_GOAL = 40;
const NAME_KEY = "zev_leads_caller";

const todayYmd = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};
const plusDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};
const ymdOf = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
};
const niceDate = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

/** Mobiles get WhatsApp; landlines only a call. */
function mobileDigits(phone: string) {
  const key = phoneKey(phone);
  return key && /^[6-9]/.test(key) ? `91${key}` : null;
}
function telHref(phone: string) {
  const m = mobileDigits(phone);
  if (m) return `tel:+${m}`;
  const d = phone.replace(/\D/g, "");
  return d ? `tel:${d}` : "";
}

/** The landing page for this kind of business, on a tracked link. */
function landingFor(p: Prospect) {
  const slug = { clinic: "clinics", salon: "salons", gym: "gyms", coaching: "coaching", cafe: "cafes" }[p.category as string];
  const known = slug && NICHES.some((n) => n.slug === slug) ? slug : "local-business";
  return `https://www.zev.world/for/${known}?utm_source=call&utm_medium=whatsapp`;
}
function whatsappHref(p: Prospect) {
  const m = mobileDigits(p.phone);
  if (!m) return "";
  const text =
    p.website_status === "bad"
      ? `Hi, thanks for taking my call! Here's how a fresh website for ${p.name} could look, with prices: ${landingFor(p)}\n\nZev's Agency, Hyderabad`
      : `Hi, thanks for taking my call! Here's how a website for ${p.name} could look, with prices: ${landingFor(p)}\n\nZev's Agency, Hyderabad`;
  return `https://wa.me/${m}?text=${encodeURIComponent(text)}`;
}
const mapsHref = (p: Prospect) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.name} ${p.area ?? ""} ${p.city}`)}`;

const isDue = (p: Prospect, t: string) =>
  (p.status === "call_back" || p.status === "interested") && !!p.follow_up_on && p.follow_up_on <= t;

type View = "tocall" | "followup" | "interested" | "done" | "all";
const VIEWS: Record<View, (p: Prospect) => boolean> = {
  tocall: (p) => p.status === "new" || p.status === "no_answer",
  followup: (p) => p.status === "call_back" || p.status === "interested",
  interested: (p) => p.status === "interested" || p.status === "won",
  done: (p) => p.status === "won" || p.status === "not_interested",
  all: () => true,
};
const VIEW_LABEL: Record<View, string> = {
  tocall: "To call",
  followup: "Follow up",
  interested: "Interested",
  done: "Done",
  all: "All",
};
const siteRank: Record<WebsiteStatus, number> = { none: 0, bad: 1, unknown: 2, ok: 3 };
const statusTone: Record<Status, string | undefined> = {
  new: undefined,
  no_answer: undefined,
  call_back: "amber",
  interested: "blue",
  won: "green",
  not_interested: "off",
};

async function api<T>(method: string, body?: unknown, query = ""): Promise<T> {
  const res = await fetch(`/api/leads-list/prospects${query}`, {
    method,
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

/* ── Desk ───────────────────────────────────────────────────────────────── */

export function LeadsDesk() {
  const router = useRouter();
  const [rows, setRows] = useState<Prospect[]>([]);
  const [cities, setCities] = useState<string[]>(["Hyderabad"]);
  const [city, setCity] = useState("Hyderabad");
  const [loadError, setLoadError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState<View>("tocall");
  const [need, setNeed] = useState<Need | "all">("website");
  const [site, setSite] = useState<WebsiteStatus | "all">("all");
  const [cat, setCat] = useState<Category | "all">("all");
  const [area, setArea] = useState("all");
  const [search, setSearch] = useState("");
  const [caller, setCaller] = useState("");
  const [toast, setToast] = useState("");
  const t = todayYmd();

  useEffect(() => {
    setCaller(sessionGet(NAME_KEY) || "");
  }, []);

  const load = useCallback(async (c: string) => {
    try {
      const data = await api<{ rows: Prospect[]; cities: string[] }>("GET", undefined, `?city=${encodeURIComponent(c)}`);
      setRows(data.rows);
      setCities(data.cities.length ? data.cities : ["Hyderabad"]);
      setLoadError("");
    } catch (e) {
      setLoadError((e as Error).message);
    } finally {
      setLoaded(true);
    }
  }, []);
  useEffect(() => {
    void load(city);
  }, [city, load]);

  const say = (msg: string) => {
    setToast(msg);
    window.clearTimeout((say as unknown as { t?: number }).t);
    (say as unknown as { t?: number }).t = window.setTimeout(() => setToast(""), 2500);
  };

  const areas = useMemo(() => [...new Set(rows.map((r) => r.area).filter(Boolean) as string[])].sort(), [rows]);

  const scoped = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(
      (p) =>
        (need === "all" || p.need === need) &&
        (site === "all" || p.website_status === site) &&
        (cat === "all" || p.category === cat) &&
        (area === "all" || p.area === area) &&
        (!q || p.name.toLowerCase().includes(q) || p.phone.includes(q) || (p.subtype ?? "").toLowerCase().includes(q))
    );
  }, [rows, need, site, cat, area, search]);

  const shown = useMemo(() => {
    const list = scoped.filter(VIEWS[view]);
    if (view === "followup") return list.sort((a, b) => (a.follow_up_on ?? "9999").localeCompare(b.follow_up_on ?? "9999"));
    if (view === "tocall")
      return list.sort(
        (a, b) =>
          a.attempts - b.attempts ||
          siteRank[a.website_status] - siteRank[b.website_status] ||
          (a.area ?? "").localeCompare(b.area ?? "") ||
          a.name.localeCompare(b.name)
      );
    return list.sort((a, b) => (b.last_called_at ?? b.created_at).localeCompare(a.last_called_at ?? a.created_at));
  }, [scoped, view]);

  const callsToday = rows.filter((p) => ymdOf(p.last_called_at) === t).length;

  const apply = (row: Prospect) => setRows((rs) => rs.map((r) => (r.id === row.id ? row : r)));

  async function patch(id: string, body: Record<string, unknown>) {
    try {
      const data = await api<{ row: Prospect }>("PATCH", { id, ...body });
      apply(data.row);
      say("Saved");
    } catch (e) {
      say((e as Error).message);
    }
  }

  function outcome(p: Prospect, status: Status) {
    const body: Record<string, unknown> = { status, logCall: true };
    if (caller) body.called_by = caller;
    if (status === "call_back") body.follow_up_on = p.follow_up_on && p.follow_up_on > t ? p.follow_up_on : plusDays(1);
    else if (status === "interested") body.follow_up_on = p.follow_up_on && p.follow_up_on > t ? p.follow_up_on : plusDays(2);
    else body.follow_up_on = null;
    void patch(p.id, body);
  }

  function copyNumber(p: Prospect) {
    try {
      navigator.clipboard.writeText(p.phone).then(
        () => say("Number copied"),
        () => say(p.phone)
      );
    } catch {
      say(p.phone);
    }
  }

  async function signOut() {
    await fetch("/api/leads-list/login", { method: "DELETE" });
    router.refresh();
  }

  function exportCsv() {
    const cols: (keyof Prospect)[] = ["name", "phone", "city", "area", "category", "subtype", "need", "website_status", "website_url", "status", "follow_up_on", "last_called_at", "attempts", "called_by", "notes", "source_url"];
    const q = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [cols.join(","), ...scoped.map((r) => cols.map((k) => q(r[k])).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `zev-leads-${city.toLowerCase()}-${t}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const counts = (Object.keys(VIEWS) as View[]).map((v) => [v, scoped.filter(VIEWS[v]).length] as const);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-7 px-4 pb-24 pt-7 sm:px-6">
      {/* Header */}
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="text-[28px] font-semibold tracking-tight">
            leads<span className="ml-0.5 inline-block h-[0.2em] w-[0.2em] rounded-full bg-[color:var(--l-accent)]" aria-hidden />
          </h1>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <span className="leads-label">City</span>
              <select value={city} onChange={(e) => setCity(e.target.value)} className="leads-input !min-h-[36px] !w-auto !py-1.5 !text-sm">
                {cities.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <button type="button" onClick={signOut} className="text-sm text-[color:var(--l-muted)] hover:text-[color:var(--l-fg)]">
              Sign out
            </button>
          </div>
        </div>
        <p className="text-sm text-[color:var(--l-muted)]">
          Local businesses in {city}. Researchers add them; callers phone, log the outcome and follow up on WhatsApp.
        </p>
        <label className="flex flex-wrap items-center gap-2 text-sm">
          <span className="leads-label">Your name</span>
          <input
            value={caller}
            onChange={(e) => {
              setCaller(e.target.value);
              sessionSet(NAME_KEY, e.target.value);
            }}
            placeholder="so calls are logged under you"
            className="leads-input !min-h-[36px] !w-56 !py-1.5 !text-sm"
          />
        </label>
      </header>

      {/* Today */}
      <section aria-label="Today" className="grid grid-cols-2 overflow-hidden rounded-[14px] border border-[color:var(--l-line)] bg-[color:var(--l-surface)] sm:grid-cols-4">
        {[
          { v: String(callsToday), l: `calls today, of ${DAILY_GOAL}`, meter: Math.min(100, (callsToday / DAILY_GOAL) * 100) },
          { v: String(rows.filter(VIEWS.tocall).length), l: "left to call" },
          { v: String(rows.filter((p) => isDue(p, t)).length), l: "follow-ups due" },
          { v: `${rows.filter((p) => p.status === "interested").length} · ${rows.filter((p) => p.status === "won").length}`, l: "interested · won" },
        ].map((s, i) => (
          <div key={s.l} className={`flex min-w-0 flex-col gap-1 p-3.5 ${i % 2 ? "border-l" : ""} ${i >= 2 ? "border-t sm:border-t-0" : ""} ${i === 2 ? "sm:border-l" : ""} border-[color:var(--l-line)]`}>
            <b className="text-2xl font-semibold tabular-nums tracking-tight">{s.v}</b>
            <span className="text-xs leading-tight text-[color:var(--l-muted)]">{s.l}</span>
            {s.meter !== undefined && (
              <span className="mt-1 h-1 overflow-hidden rounded bg-[color:var(--l-surface-2)]">
                <span className="block h-full bg-[color:var(--l-accent)] transition-[width]" style={{ width: `${s.meter}%` }} />
              </span>
            )}
          </div>
        ))}
      </section>

      {/* Filters */}
      <div className="sticky top-0 z-10 -my-2.5 flex flex-col gap-2 bg-[color:var(--l-bg)] py-2.5">
        <div className="leads-scroll" role="toolbar" aria-label="Show">
          {counts.map(([v, n]) => (
            <button key={v} type="button" className="leads-chip leads-tab" aria-pressed={view === v} onClick={() => setView(v)}>
              {VIEW_LABEL[v]} <span className="font-mono text-xs opacity-70">{n}</span>
            </button>
          ))}
        </div>
        <div className="leads-scroll" role="toolbar" aria-label="Need">
          {(["website", "app", "content", "all"] as const).map((n) => (
            <button key={n} type="button" className="leads-chip" aria-pressed={need === n} onClick={() => setNeed(n)}>
              {n === "all" ? "Any need" : NEEDS[n]}
            </button>
          ))}
          <span className="mx-1 w-px self-stretch bg-[color:var(--l-line)]" aria-hidden />
          {(["all", "none", "bad", "unknown", "ok"] as const).map((s) => (
            <button key={s} type="button" className="leads-chip" aria-pressed={site === s} onClick={() => setSite(s)}>
              {s === "all" ? "Any site status" : WEBSITE_STATUS[s]}
            </button>
          ))}
        </div>
        <div className="leads-scroll" role="toolbar" aria-label="Kind and area">
          <select value={cat} onChange={(e) => setCat(e.target.value as Category | "all")} className="leads-input !min-h-[36px] !w-auto !rounded-full !py-1 !text-[13px]">
            <option value="all">All kinds</option>
            {(Object.keys(CATEGORIES) as Category[]).map((k) => (
              <option key={k} value={k}>
                {CATEGORIES[k]}
              </option>
            ))}
          </select>
          <select value={area} onChange={(e) => setArea(e.target.value)} className="leads-input !min-h-[36px] !w-auto !rounded-full !py-1 !text-[13px]">
            <option value="all">All areas</option>
            {areas.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or number" className="leads-input !min-h-[36px] !w-52 !rounded-full !py-1 !text-[13px]" />
        </div>
      </div>

      {/* List */}
      <section className="flex flex-col gap-3" aria-live="polite">
        {!loaded ? (
          <Empty title="Loading the list…" />
        ) : loadError ? (
          <Empty title="Couldn't load the list." body={loadError} />
        ) : shown.length === 0 ? (
          rows.length === 0 ? (
            <Empty title={`No leads in ${city} yet.`} body="Add one below, or import a batch from a researcher." />
          ) : (
            <Empty title="Nothing here." body={view === "tocall" ? "Everyone matching these filters has been called." : "Try another tab or filter."} />
          )
        ) : (
          shown.map((p) => <Card key={p.id} p={p} t={t} onOutcome={outcome} onPatch={patch} onCopy={copyNumber} />)
        )}
      </section>

      <AddPanel
        city={city}
        onAdded={(added, skipped, problems) => {
          setRows((rs) => [...added, ...rs]);
          const bits = [`Added ${added.length}`];
          if (skipped) bits.push(`${skipped} already on the list`);
          if (problems.length) bits.push(`${problems.length} skipped (${problems[0]})`);
          say(bits.join(" · "));
        }}
        caller={caller}
      />

      <ScriptPanel />

      <footer className="flex flex-wrap items-center justify-between gap-3 text-xs text-[color:var(--l-muted)]">
        <span>
          {rows.length} in {city} · {scoped.length} match the filters
        </span>
        <button type="button" onClick={exportCsv} className="leads-btn !min-h-[36px] !text-xs">
          Export CSV
        </button>
      </footer>

      {toast && (
        <div role="status" className="fixed bottom-5 left-1/2 z-20 max-w-[90vw] -translate-x-1/2 rounded-full bg-[color:var(--l-fg)] px-4 py-2 text-sm text-[color:var(--l-bg)] shadow-lg">
          {toast}
        </div>
      )}
    </main>
  );
}

function Empty({ title, body }: { title: string; body?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-[14px] border border-dashed border-[color:var(--l-line)] px-5 py-7 text-center text-[color:var(--l-muted)]">
      <b className="font-semibold text-[color:var(--l-fg)]">{title}</b>
      {body && <span className="text-sm">{body}</span>}
    </div>
  );
}

/* ── One business ───────────────────────────────────────────────────────── */

function Card({
  p,
  t,
  onOutcome,
  onPatch,
  onCopy,
}: {
  p: Prospect;
  t: string;
  onOutcome: (p: Prospect, s: Status) => void;
  onPatch: (id: string, body: Record<string, unknown>) => Promise<void>;
  onCopy: (p: Prospect) => void;
}) {
  const [notes, setNotes] = useState(p.notes ?? "");
  const notesRef = useRef(p.notes ?? "");
  useEffect(() => {
    if ((p.notes ?? "") !== notesRef.current) {
      notesRef.current = p.notes ?? "";
      setNotes(p.notes ?? "");
    }
  }, [p.notes]);

  const due = isDue(p, t);
  const tel = telHref(p.phone);
  const wa = whatsappHref(p);
  const showFollow = p.status === "call_back" || p.status === "interested";
  const kind = p.subtype || CATEGORIES[p.category] || "business";
  const siteTone = p.website_status === "none" ? "green" : p.website_status === "bad" ? "red" : undefined;
  const lastLine = [
    p.last_called_at ? `called ${niceDate(ymdOf(p.last_called_at))}${p.attempts > 1 ? ` · ${p.attempts} tries` : ""}${p.called_by ? ` by ${p.called_by}` : ""}` : "",
    p.added_by ? `added by ${p.added_by}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="leads-card" data-due={due}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[17px] font-semibold leading-snug tracking-tight [overflow-wrap:anywhere]">{p.name}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-[color:var(--l-muted)]">
            <span>{kind}</span>
            <span>{p.area || p.city}</span>
            <span className="leads-pill !text-[11px]" data-tone={siteTone}>
              {WEBSITE_STATUS[p.website_status]}
            </span>
            {p.need !== "website" && <span className="leads-pill !text-[11px]">{NEEDS[p.need]}</span>}
            {p.website_url && (
              <a href={p.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 underline-offset-2 hover:underline">
                their site <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
              </a>
            )}
          </div>
        </div>
        <span className="leads-pill" data-tone={statusTone[p.status]}>
          {STATUSES[p.status]}
          {due ? " · due" : ""}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 select-all font-mono text-lg font-medium tracking-wide">{p.phone}</span>
        {tel && (
          <a href={tel} className="leads-btn leads-btn-primary">
            <Phone className="h-4 w-4" strokeWidth={1.75} /> Call
          </a>
        )}
        <button type="button" onClick={() => onCopy(p)} className="leads-btn" aria-label="Copy number">
          <Copy className="h-4 w-4" strokeWidth={1.75} />
        </button>
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="leads-btn">
            <MessageCircle className="h-4 w-4" strokeWidth={1.75} /> WhatsApp
          </a>
        )}
        <a href={mapsHref(p)} target="_blank" rel="noopener noreferrer" className="leads-btn" aria-label="Check on Google Maps">
          <MapPin className="h-4 w-4" strokeWidth={1.75} /> Maps
        </a>
      </div>

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="How did the call go?">
        {OUTCOMES.map((o) => (
          <button key={o} type="button" className="leads-out" aria-pressed={p.status === o} onClick={() => onOutcome(p, o)}>
            {STATUSES[o]}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2.5 border-t border-[color:var(--l-line)] pt-3">
        {showFollow && (
          <label className="flex flex-wrap items-center gap-2 text-[13px] text-[color:var(--l-muted)]">
            Follow up on
            <input
              type="date"
              value={p.follow_up_on ?? ""}
              onChange={(e) => void onPatch(p.id, { follow_up_on: e.target.value || null })}
              className="leads-input !min-h-[36px] !w-auto !py-1.5 !text-sm"
            />
          </label>
        )}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => {
            if (notes !== (p.notes ?? "")) void onPatch(p.id, { notes });
          }}
          placeholder="Notes: who you spoke to, what they said"
          className="leads-input min-h-[60px] resize-y !text-sm"
        />
        {(lastLine || p.source_url) && (
          <p className="text-xs text-[color:var(--l-muted)]">
            {lastLine}
            {lastLine && p.source_url ? " · " : ""}
            {p.source_url && (
              <a href={p.source_url} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
                where the number came from
              </a>
            )}
          </p>
        )}
      </div>
    </article>
  );
}

/* ── Add / import ───────────────────────────────────────────────────────── */

function AddPanel({
  city,
  caller,
  onAdded,
}: {
  city: string;
  caller: string;
  onAdded: (added: Prospect[], skipped: number, problems: string[]) => void;
}) {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [bulk, setBulk] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function submitOne(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const entry = Object.fromEntries(f.entries()) as Record<string, string>;
    entry.added_by = caller;
    setBusy(true);
    setMsg("");
    try {
      const data = await api<{ added: Prospect[]; skipped: number; problems: string[]; error?: string }>("POST", entry);
      if (data.error) {
        setMsg(data.error);
        return;
      }
      onAdded(data.added, data.skipped, data.problems);
      formRef.current?.reset();
      (formRef.current?.elements.namedItem("name") as HTMLInputElement | null)?.focus();
    } catch (err) {
      setMsg((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function submitBulk() {
    let items: unknown;
    try {
      items = JSON.parse(bulk);
    } catch {
      items = parseCsv(bulk);
    }
    if (!Array.isArray(items) || !items.length) {
      setMsg("Paste a JSON array or CSV with at least name and phone.");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      const rows = (items as Record<string, unknown>[]).map((r) => ({ city, ...r, added_by: r.added_by || caller }));
      const data = await api<{ added: Prospect[]; skipped: number; problems: string[]; error?: string }>("POST", rows);
      if (data.error && !data.added.length) {
        setMsg(data.error);
        return;
      }
      onAdded(data.added, data.skipped, data.problems);
      setBulk("");
    } catch (err) {
      setMsg((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <details className="leads-panel">
      <summary>Add a business</summary>
      <div className="flex flex-col gap-5 px-4 pb-5">
        <form ref={formRef} onSubmit={submitOne} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input type="hidden" name="city" value={city} />
          <Field label="Business name" className="sm:col-span-2">
            <input name="name" required className="leads-input" placeholder="Sri Sai Dental Clinic" />
          </Field>
          <Field label="Phone">
            <input name="phone" required inputMode="tel" className="leads-input" placeholder="+91 98765 43210" />
          </Field>
          <Field label="Area">
            <input name="area" className="leads-input" placeholder="Boduppal" />
          </Field>
          <Field label="Kind">
            <select name="category" className="leads-input" defaultValue="clinic">
              {(Object.keys(CATEGORIES) as Category[]).map((k) => (
                <option key={k} value={k}>
                  {CATEGORIES[k]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="More exactly">
            <input name="subtype" className="leads-input" placeholder="dental, bakery, interior designer…" />
          </Field>
          <Field label="What they need">
            <select name="need" className="leads-input" defaultValue="website">
              {(Object.keys(NEEDS) as Need[]).map((k) => (
                <option key={k} value={k}>
                  {NEEDS[k]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Their website">
            <select name="website_status" className="leads-input" defaultValue="none">
              {(Object.keys(WEBSITE_STATUS) as WebsiteStatus[]).map((k) => (
                <option key={k} value={k}>
                  {WEBSITE_STATUS[k]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Website address (if any)">
            <input name="website_url" className="leads-input" placeholder="https://" />
          </Field>
          <Field label="Where you found the number">
            <input name="source_url" className="leads-input" placeholder="https://" />
          </Field>
          <Field label="Notes" className="sm:col-span-2">
            <input name="notes" className="leads-input" placeholder="4.6 stars, 120 reviews, owner is Dr. Rao; site is from 2012" />
          </Field>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <button type="submit" disabled={busy} className="leads-btn leads-btn-primary">
              Add to list
            </button>
            {msg && (
              <span role="status" className="text-sm text-[color:var(--l-accent)]">
                {msg}
              </span>
            )}
          </div>
        </form>

        <details>
          <summary className="cursor-pointer text-sm font-medium">Import a batch (JSON or CSV)</summary>
          <div className="mt-3 flex flex-col gap-2">
            <p className="text-xs text-[color:var(--l-muted)]">
              Columns: name, phone, area, category, subtype, need, website_status (none / bad / ok / unknown), website_url, source_url, notes. Numbers already on the list are skipped.
            </p>
            <textarea value={bulk} onChange={(e) => setBulk(e.target.value)} rows={6} className="leads-input font-mono !text-xs" placeholder={`name,phone,area,category,website_status\nSri Sai Dental,+91 98765 43210,Boduppal,clinic,none`} />
            <div>
              <button type="button" onClick={submitBulk} disabled={busy || !bulk.trim()} className="leads-btn">
                Import
              </button>
            </div>
          </div>
        </details>
      </div>
    </details>
  );
}

function Field({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`flex min-w-0 flex-col gap-1.5 text-[13px] font-medium ${className}`}>
      {label}
      {children}
    </label>
  );
}

/** A forgiving CSV: a header row, commas, quotes allowed. */
function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const split = (line: string) => {
    const out: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQ && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQ = !inQ;
      } else if (c === "," && !inQ) {
        out.push(cur);
        cur = "";
      } else cur += c;
    }
    out.push(cur);
    return out.map((s) => s.trim());
  };
  const head = split(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, "_"));
  return lines.slice(1).map((l) => Object.fromEntries(split(l).map((v, i) => [head[i] ?? `col${i}`, v])));
}

/* ── Script ─────────────────────────────────────────────────────────────── */

function ScriptPanel() {
  return (
    <details className="leads-panel">
      <summary>Call script</summary>
      <div className="flex flex-col gap-4 px-4 pb-5 text-[15px] leading-relaxed">
        {[
          ["Open", "“Hi, am I speaking with the owner of [business]? I'm [your name] from Zev's Agency, a web studio here in Hyderabad. Do you have one minute?”"],
          ["Hook", "“I found [business] on Google Maps. Good reviews, but no website. When people nearby search for a [clinic], the ones with a proper website usually get the call.”"],
          ["Hook (bad site)", "“I came across your website. It doesn't open well on a phone, and most of your customers are on one. A fresh one takes us 24 hours.”"],
          ["Offer", "“We make clean websites for businesses like yours: your services, timings, location and a WhatsApp button. Live in 24 hours, from ₹15,000.”"],
          ["Ask", "“Can I WhatsApp you how it would look, with the price? It takes two minutes to see.”"],
          ["Yes", "Tap Interested, then WhatsApp on their card: it sends the page for their kind of business. Follow up in two days."],
        ].map(([k, v]) => (
          <div key={k} className="grid gap-1 sm:grid-cols-[110px_1fr] sm:gap-3">
            <span className="leads-label pt-1">{k}</span>
            <p>{v}</p>
          </div>
        ))}
        <div className="border-t border-[color:var(--l-line)]">
          {[
            ["“We're already on Instagram / Justdial.”", "“Great for people who already follow you. A website is what new customers find on Google, and it links to your Instagram.”"],
            ["“Too expensive.”", "“It's a one-time ₹15,000 for the one-page site. One or two new customers a month and it has paid for itself.”"],
            ["“Not now, I'm busy.”", "“No problem. Can I WhatsApp you the details? I'll check back next week.” Tap Call back."],
            ["“We already have someone.”", "“Great. If you ever want a refresh or a second opinion, save my number.” Tap Not interested."],
          ].map(([q, a]) => (
            <div key={q} className="flex flex-col gap-0.5 border-b border-[color:var(--l-line)] py-3">
              <b className="font-semibold">{q}</b>
              <p className="text-[color:var(--l-muted)]">{a}</p>
            </div>
          ))}
        </div>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-[color:var(--l-muted)]">
          <li>
            <b className="font-semibold text-[color:var(--l-fg)]">Call from the outreach SIM</b>, never the number on the website. Numbers reported for promotional calls can be cut off.
          </li>
          <li>
            <b className="font-semibold text-[color:var(--l-fg)]">A “no” is final.</b> Tap Not interested and never call that number again.
          </li>
          <li>
            <b className="font-semibold text-[color:var(--l-fg)]">Best times:</b> 11 am–1 pm and 3–6 pm. Keep it under two minutes; the goal is permission to WhatsApp.
          </li>
        </ul>
      </div>
    </details>
  );
}
