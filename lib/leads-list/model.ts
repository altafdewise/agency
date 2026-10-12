/**
 * The outreach list (/leads): what a prospect looks like, the fixed choices
 * on it, and the checks that keep hand-entered and imported rows clean.
 * Shared by the API routes and the desk UI.
 */

export const CATEGORIES = {
  clinic: "Clinics",
  salon: "Salons",
  gym: "Gyms",
  coaching: "Coaching & schools",
  cafe: "Cafés & food",
  shop: "Shops",
  services: "Services",
  realty: "Real estate",
  auto: "Auto",
  events: "Events",
  other: "Other",
} as const;
export type Category = keyof typeof CATEGORIES;

export const NEEDS = {
  website: "Website",
  app: "App",
  content: "Content / editing",
} as const;
export type Need = keyof typeof NEEDS;

export const WEBSITE_STATUS = {
  none: "No website",
  bad: "Bad website",
  ok: "Has a website",
  unknown: "Not checked",
} as const;
export type WebsiteStatus = keyof typeof WEBSITE_STATUS;

export const STATUSES = {
  new: "To call",
  no_answer: "No answer",
  call_back: "Call back",
  interested: "Interested",
  not_interested: "Not interested",
  won: "Won",
} as const;
export type Status = keyof typeof STATUSES;
export const OUTCOMES: Status[] = ["no_answer", "call_back", "interested", "not_interested", "won"];

export interface Prospect {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  phone: string;
  phone_key: string;
  city: string;
  area: string | null;
  category: Category;
  subtype: string | null;
  need: Need;
  website_status: WebsiteStatus;
  website_url: string | null;
  source_url: string | null;
  notes: string | null;
  status: Status;
  attempts: number;
  last_called_at: string | null;
  follow_up_on: string | null;
  added_by: string | null;
  called_by: string | null;
}

/** What a researcher enters or imports; everything else is derived. */
export interface ProspectInput {
  name: string;
  phone: string;
  city?: string;
  area?: string;
  category?: string;
  subtype?: string;
  need?: string;
  website_status?: string;
  website_url?: string;
  source_url?: string;
  notes?: string;
  added_by?: string;
}

const isKey = <T extends object>(o: T, k: unknown): k is keyof T =>
  typeof k === "string" && Object.prototype.hasOwnProperty.call(o, k);

const text = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "";

/** Digits only; an Indian mobile or landline with or without +91 / 0. */
export function phoneKey(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) return d.slice(2);
  if (d.length === 11 && d.startsWith("0")) return d.slice(1);
  return d.length === 10 ? d : "";
}

/** +91 98765 43210 for mobiles, 040 2720 1234 for landlines. */
export function formatPhone(phone: string) {
  const key = phoneKey(phone);
  if (!key) return phone.trim();
  if (/^[6-9]/.test(key)) return `+91 ${key.slice(0, 5)} ${key.slice(5)}`;
  const d = phone.replace(/\D/g, "");
  const landline = d.length === 11 && d.startsWith("0") ? d : `0${key}`;
  return `${landline.slice(0, 3)} ${landline.slice(3, 7)} ${landline.slice(7)}`;
}

const url = (v: unknown) => {
  const s = text(v, 500);
  if (!s) return null;
  try {
    const u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
};

/** Cleans one entry; returns the row to insert, or the reason it can't be. */
export function normalizeInput(raw: unknown): { row: Omit<Prospect, "id" | "created_at" | "updated_at"> } | { error: string } {
  if (!raw || typeof raw !== "object") return { error: "Not an entry." };
  const r = raw as Record<string, unknown>;
  const name = text(r.name, 120);
  const phone = text(r.phone, 30);
  const key = phoneKey(phone);
  if (!name) return { error: "Missing the business name." };
  if (!key) return { error: `"${name}": the phone number needs 10 digits.` };

  const website_status = isKey(WEBSITE_STATUS, r.website_status)
    ? r.website_status
    : r.website_status === "none found"
      ? "none"
      : "unknown";

  return {
    row: {
      name,
      phone: formatPhone(phone),
      phone_key: key,
      city: text(r.city, 60) || "Hyderabad",
      area: text(r.area, 60) || null,
      category: isKey(CATEGORIES, r.category) ? r.category : "other",
      subtype: text(r.subtype, 60) || null,
      need: isKey(NEEDS, r.need) ? r.need : "website",
      website_status,
      website_url: url(r.website_url),
      source_url: url(r.source_url ?? r.source),
      notes: text(r.notes, 2000) || null,
      status: "new",
      attempts: 0,
      last_called_at: null,
      follow_up_on: null,
      added_by: text(r.added_by, 60) || null,
      called_by: null,
    },
  };
}

/** The fields a caller may change from the desk. */
export function normalizePatch(raw: unknown): { patch: Partial<Prospect> } | { error: string } {
  if (!raw || typeof raw !== "object") return { error: "Nothing to update." };
  const r = raw as Record<string, unknown>;
  const patch: Partial<Prospect> = {};

  if ("status" in r) {
    if (!isKey(STATUSES, r.status)) return { error: "Unknown outcome." };
    patch.status = r.status;
  }
  if ("notes" in r) patch.notes = text(r.notes, 2000) || null;
  if ("follow_up_on" in r) {
    const v = r.follow_up_on;
    if (v === null || v === "") patch.follow_up_on = null;
    else if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v)) patch.follow_up_on = v;
    else return { error: "Follow-up date must be YYYY-MM-DD." };
  }
  if ("called_by" in r) patch.called_by = text(r.called_by, 60) || null;
  if ("website_status" in r) {
    if (!isKey(WEBSITE_STATUS, r.website_status)) return { error: "Unknown website status." };
    patch.website_status = r.website_status;
  }
  if ("need" in r) {
    if (!isKey(NEEDS, r.need)) return { error: "Unknown need." };
    patch.need = r.need;
  }
  if ("website_url" in r) patch.website_url = url(r.website_url);
  if ("area" in r) patch.area = text(r.area, 60) || null;
  if ("subtype" in r) patch.subtype = text(r.subtype, 60) || null;
  if ("logCall" in r && r.logCall === true) patch.last_called_at = new Date().toISOString();

  if (!Object.keys(patch).length) return { error: "Nothing to update." };
  return { patch };
}
