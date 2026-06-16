/**
 * Shared contact details + link builders. Fill these via env (NEXT_PUBLIC_*)
 * or edit the fallbacks. Used by the estimate fallback, the menu, and Step 8.
 */
export const CONTACT = {
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@maggie.agency",
  // WhatsApp number: digits only, country code, no "+" or spaces.
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "910000000000",
  cal: process.env.NEXT_PUBLIC_CAL_LINK || "https://cal.com/your-handle/intro",
};

export function whatsappHref(message?: string) {
  const base = `https://wa.me/${CONTACT.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function mailtoHref(subject?: string, body?: string) {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const qs = params.toString();
  return `mailto:${CONTACT.email}${qs ? `?${qs}` : ""}`;
}
