import { Resend } from "resend";
import type { Booking } from "@/lib/bookings";

const DEFAULT_FROM = "Maggie's Agency <admin@maggie.agency>";

let resendClient: Resend | null = null;

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;

  resendClient ??= new Resend(key);
  return resendClient;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function slotLabel(time: string) {
  const [hourRaw, minute = "00"] = time.split(":");
  const hour = Number(hourRaw);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute} ${period}`;
}

function dateLabel(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function emailShell({
  preview,
  children,
}: {
  preview: string;
  children: string;
}) {
  return `<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <title>${escapeHtml(preview)}</title>
  </head>
  <body style="margin:0;background:#f7f4ee;padding:32px 20px;font-family:Arial,sans-serif;color:#171717;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preview)}</div>
    <div style="max-width:580px;margin:0 auto;background:#ffffff;border:1px solid #e9e4da;border-radius:14px;padding:28px;">
      ${children}
    </div>
  </body>
</html>`;
}

function detailRow(label: string, value: string) {
  return `<tr>
    <td style="padding:10px 0;color:#777;font-size:13px;width:120px;">${label}</td>
    <td style="padding:10px 0;color:#171717;font-size:14px;font-weight:600;">${escapeHtml(value)}</td>
  </tr>`;
}

function customerHtml(booking: Booking) {
  const name = booking.contact.name?.trim() || "there";
  const when = `${dateLabel(booking.date)} at ${slotLabel(booking.time)}`;

  return emailShell({
    preview: `Your call is booked for ${when}.`,
    children: `
      <h1 style="margin:0 0 18px;font-size:26px;line-height:1.15;font-weight:700;">Your call is booked.</h1>
      <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#333;">Hi ${escapeHtml(name)}, thanks for booking with Maggie's Agency. We have your call on the calendar.</p>
      <table role="presentation" style="width:100%;border-collapse:collapse;margin:22px 0;border-top:1px solid #eee;border-bottom:1px solid #eee;">
        ${detailRow("Date", dateLabel(booking.date))}
        ${detailRow("Time", `${slotLabel(booking.time)} IST`)}
        ${detailRow("Email", booking.contact.email)}
        ${booking.contact.phone ? detailRow("Phone", booking.contact.phone) : ""}
      </table>
      <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#555;">No prep deck needed. Bring the context, questions, and anything you already know. We will keep it focused.</p>
      <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#888;">Maggie's Agency</p>
    `,
  });
}

function adminHtml(booking: Booking) {
  const when = `${dateLabel(booking.date)} at ${slotLabel(booking.time)} IST`;
  const needs = booking.brief.needs?.join(", ") || "Not specified";

  return emailShell({
    preview: `New call booked: ${booking.contact.email}`,
    children: `
      <h1 style="margin:0 0 18px;font-size:26px;line-height:1.15;font-weight:700;">New call booked.</h1>
      <table role="presentation" style="width:100%;border-collapse:collapse;margin:22px 0;border-top:1px solid #eee;border-bottom:1px solid #eee;">
        ${detailRow("When", when)}
        ${detailRow("Name", booking.contact.name || "Not provided")}
        ${detailRow("Email", booking.contact.email)}
        ${booking.contact.phone ? detailRow("Phone", booking.contact.phone) : ""}
        ${detailRow("Needs", needs)}
        ${detailRow("Persona", booking.brief.persona || "Not specified")}
      </table>
      <p style="margin:0;font-size:14px;line-height:1.7;color:#444;white-space:pre-line;">${escapeHtml(booking.brief.description || "No brief provided.")}</p>
    `,
  });
}

export async function sendBookingEmails(booking: Booking) {
  const resend = getResend();
  if (!resend) {
    console.info("[email] RESEND_API_KEY missing; skipped booking emails.");
    return { skipped: true };
  }

  const from = process.env.BOOKING_EMAIL_FROM || DEFAULT_FROM;
  const adminTo =
    process.env.BOOKING_NOTIFY_EMAIL ||
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
    "admin@maggie.agency";

  const { error } = await resend.batch.send([
    {
      from,
      to: booking.contact.email,
      subject: "Your Maggie call is booked",
      html: customerHtml(booking),
    },
    {
      from,
      to: adminTo,
      subject: `New call booked: ${booking.contact.email}`,
      html: adminHtml(booking),
    },
  ]);

  if (error) throw new Error(error.message);

  return { skipped: false };
}
