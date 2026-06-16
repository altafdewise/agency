"use client";

import { useMemo, useState } from "react";
import {
  CalendarClock,
  LockKeyhole,
  Mail,
  Phone,
  RefreshCw,
  User,
} from "lucide-react";
import type { Booking } from "@/lib/bookings";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/inputs";

function prettyDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function prettyTime(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return new Date(2026, 0, 1, hour, minute).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function inr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function describeNeed(booking: Booking) {
  const needs = booking.brief.needs.length
    ? booking.brief.needs.join(", ").replaceAll("_", " ")
    : "not specified";
  return booking.brief.customNeed ? `${needs} - ${booking.brief.customNeed}` : needs;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sortedBookings = useMemo(
    () => [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [bookings]
  );

  const loadBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/bookings/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as {
        bookings?: Booking[];
        error?: string;
      };

      if (!res.ok || !data.bookings) {
        throw new Error(data.error || "Could not load bookings.");
      }

      setBookings(data.bookings);
      setUnlocked(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] px-6 py-10 sm:px-10">
      <section className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Admin</p>
            <h1 className="mt-4 font-display text-5xl font-semibold leading-none tracking-tightest text-foreground sm:text-7xl">
              call bookings
            </h1>
          </div>

          {unlocked && (
            <Button variant="ghost" onClick={loadBookings} disabled={loading}>
              <RefreshCw
                className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"}
                strokeWidth={1.75}
              />
              refresh
            </Button>
          )}
        </div>

        {!unlocked ? (
          <form
            className="mt-12 max-w-md"
            onSubmit={(event) => {
              event.preventDefault();
              loadBookings();
            }}
          >
            <label htmlFor="admin-password" className="eyebrow mb-3 block">
              Password
            </label>
            <TextInput
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="enter admin password"
              autoComplete="current-password"
            />
            {error && <p className="mt-4 text-sm font-light text-accent">{error}</p>}
            <Button className="mt-8" size="lg" type="submit" disabled={loading}>
              <LockKeyhole className="h-4 w-4" strokeWidth={1.75} />
              {loading ? "checking" : "unlock"}
            </Button>
          </form>
        ) : (
          <div className="mt-10">
            <p className="mb-5 text-sm font-light text-muted">
              {sortedBookings.length} booking
              {sortedBookings.length === 1 ? "" : "s"} stored.
            </p>

            {sortedBookings.length === 0 ? (
              <div className="rounded-lg border border-border p-8 text-muted">
                No call bookings yet.
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border">
                <div className="grid grid-cols-[1.05fr_1fr_1.4fr_1.4fr] gap-0 border-b border-border px-5 py-3 text-[0.65rem] uppercase tracking-[0.22em] text-muted max-lg:hidden">
                  <span>Slot</span>
                  <span>Contact</span>
                  <span>Project</span>
                  <span>Estimate</span>
                </div>

                <div className="divide-y divide-border">
                  {sortedBookings.map((booking) => (
                    <article
                      key={booking.id}
                      className="grid gap-5 px-5 py-5 lg:grid-cols-[1.05fr_1fr_1.4fr_1.4fr]"
                    >
                      <div>
                        <p className="flex items-center gap-2 font-sans text-base font-medium text-foreground">
                          <CalendarClock className="h-4 w-4 text-accent" />
                          {prettyDate(booking.date)}
                        </p>
                        <p className="mt-2 text-sm text-muted">
                          {prettyTime(booking.time)} · {booking.timezone}
                        </p>
                        <p className="mt-2 text-xs text-muted/70">
                          booked {new Date(booking.createdAt).toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div className="space-y-2 text-sm">
                        {booking.contact.name && (
                          <p className="flex items-center gap-2 text-foreground">
                            <User className="h-4 w-4 text-muted" />
                            {booking.contact.name}
                          </p>
                        )}
                        <p className="flex items-center gap-2 text-foreground">
                          <Mail className="h-4 w-4 text-muted" />
                          {booking.contact.email}
                        </p>
                        {booking.contact.phone && (
                          <p className="flex items-center gap-2 text-muted">
                            <Phone className="h-4 w-4" />
                            {booking.contact.phone}
                          </p>
                        )}
                      </div>

                      <div className="text-sm">
                        <p className="font-medium text-foreground">
                          {describeNeed(booking)}
                        </p>
                        <p className="mt-2 text-muted">
                          {booking.brief.persona || "persona not specified"} ·{" "}
                          {booking.brief.stage || "stage not specified"}
                        </p>
                        {booking.brief.description && (
                          <p className="mt-3 line-clamp-3 font-light leading-relaxed text-muted">
                            {booking.brief.description}
                          </p>
                        )}
                      </div>

                      <div className="text-sm">
                        {booking.estimate ? (
                          <>
                            <p className="font-medium text-accent">
                              {inr(booking.estimate.priceLow)} -{" "}
                              {inr(booking.estimate.priceHigh)}
                            </p>
                            <p className="mt-2 text-muted">
                              {booking.estimate.timeline} · {booking.estimate.tier}
                            </p>
                            <p className="mt-3 font-light leading-relaxed text-muted">
                              {booking.estimate.summary}
                            </p>
                          </>
                        ) : (
                          <p className="text-muted">No estimate captured.</p>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
