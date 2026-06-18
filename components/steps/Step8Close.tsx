"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { StepShell } from "@/components/ui/StepShell";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/inputs";
import { Reveal } from "@/components/ui/Reveal";
import { usePath } from "@/components/PathProvider";
import { cn } from "@/lib/cn";
import type { Brief, Estimate } from "@/lib/brief";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIME_ZONE = "Asia/Kolkata";
const TIME_SLOTS = [
  { value: "14:00", label: "2:00 PM" },
  { value: "14:30", label: "2:30 PM" },
  { value: "15:00", label: "3:00 PM" },
  { value: "15:30", label: "3:30 PM" },
  { value: "16:00", label: "4:00 PM" },
  { value: "16:30", label: "4:30 PM" },
  { value: "17:00", label: "5:00 PM" },
  { value: "17:30", label: "5:30 PM" },
  { value: "18:00", label: "6:00 PM" },
];

type BookingStep = "date" | "time" | "details";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function getKolkataParts() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const value = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "00";

  return {
    year: Number(value("year")),
    month: Number(value("month")),
    day: Number(value("day")),
    hour: Number(value("hour")),
    minute: Number(value("minute")),
  };
}

function localDate(offsetDays = 0) {
  const now = getKolkataParts();
  const date = new Date(Date.UTC(now.year, now.month - 1, now.day + offsetDays));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

function minutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function slotsFor(date: string) {
  if (date !== localDate()) return TIME_SLOTS;
  const now = getKolkataParts();
  const current = now.hour * 60 + now.minute;
  return TIME_SLOTS.filter((slot) => minutes(slot.value) > current);
}

function initialDate() {
  return slotsFor(localDate()).length ? localDate() : localDate(1);
}

function prettyDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function slotLabel(value: string) {
  return TIME_SLOTS.find((slot) => slot.value === value)?.label ?? value;
}

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return { year, monthIndex: month - 1, day };
}

function dateId(year: number, monthIndex: number, day: number) {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
}

function daysInMonth(year: number, monthIndex: number) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function addMonths(year: number, monthIndex: number, offset: number) {
  const date = new Date(Date.UTC(year, monthIndex + offset, 1));
  return { year: date.getUTCFullYear(), monthIndex: date.getUTCMonth() };
}

function monthLabel(year: number, monthIndex: number) {
  return new Date(Date.UTC(year, monthIndex, 1)).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

function CalendarPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const selected = parseDate(value);
  const minDate = localDate();
  const min = parseDate(minDate);
  const [view, setView] = useState({
    year: selected.year,
    monthIndex: selected.monthIndex,
  });

  useEffect(() => {
    const selected = parseDate(value);
    setView({ year: selected.year, monthIndex: selected.monthIndex });
  }, [value]);

  const firstDay = new Date(Date.UTC(view.year, view.monthIndex, 1)).getUTCDay();
  const totalDays = daysInMonth(view.year, view.monthIndex);
  const cells = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: totalDays }, (_, index) => index + 1),
  ];
  const monthStart = dateId(view.year, view.monthIndex, 1);
  const canGoPrev = monthStart > dateId(min.year, min.monthIndex, 1);

  const setMonth = (offset: number) => {
    setView((current) => addMonths(current.year, current.monthIndex, offset));
  };

  return (
    <div
      role="group"
      aria-label="Choose call date"
      className="w-full max-w-[330px]"
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonth(-1)}
          disabled={!canGoPrev}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-foreground/[0.06] hover:text-accent disabled:pointer-events-none disabled:opacity-20"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <p className="font-sans text-base font-semibold text-foreground">
          {monthLabel(view.year, view.monthIndex)}
        </p>
        <button
          type="button"
          onClick={() => setMonth(1)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-foreground/[0.06] hover:text-accent"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-1 text-center text-[0.62rem] uppercase tracking-[0.14em] text-muted/70">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
          <span key={`${day}-${index}`} className="py-1">
            {day}
          </span>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-x-1 gap-y-2">
        {cells.map((day, index) => {
          if (!day) return <span key={`blank-${index}`} />;

          const cellDate = dateId(view.year, view.monthIndex, day);
          const disabled = cellDate < minDate;
          const isSelected = cellDate === value;

          return (
            <button
              key={cellDate}
              type="button"
              disabled={disabled}
              onClick={() => onChange(cellDate)}
              className={cn(
                "mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-200 sm:h-11 sm:w-11",
                isSelected
                  ? "bg-accent text-background shadow-[0_0_28px_rgba(255,68,56,0.36)]"
                  : "text-foreground hover:bg-foreground/[0.07] hover:text-accent",
                disabled &&
                  "pointer-events-none text-muted/25 hover:bg-transparent"
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TimeSlotPicker({
  availableSlots,
  time,
  onChange,
}: {
  availableSlots: typeof TIME_SLOTS;
  time: string;
  onChange: (value: string) => void;
}) {
  if (!availableSlots.length) {
    return (
      <p className="body-muted text-sm">
        Today is full. Pick another date.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {availableSlots.map((slot) => (
        <button
          key={slot.value}
          type="button"
          onClick={() => onChange(slot.value)}
          className={cn(
            "min-h-[46px] rounded-full border px-4 text-sm font-medium transition-all duration-200",
            time === slot.value
              ? "border-accent bg-accent text-background shadow-[0_12px_40px_-22px_rgba(255,68,56,0.95)]"
              : "border-foreground/15 bg-background/20 text-foreground hover:border-accent/55 hover:bg-foreground/[0.045]"
          )}
        >
          {slot.label}
        </button>
      ))}
    </div>
  );
}

function ContactFields({
  idPrefix,
  name,
  setName,
  email,
  setEmail,
  phone,
  setPhone,
  touched,
  setTouched,
}: {
  idPrefix: string;
  name: string;
  setName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  touched: boolean;
  setTouched: (value: boolean) => void;
}) {
  const emailValid = EMAIL_RE.test(email.trim());
  const nameId = `${idPrefix}-name`;
  const emailId = `${idPrefix}-email`;
  const phoneId = `${idPrefix}-phone`;

  return (
    <div className="grid gap-6 sm:grid-cols-3">
      <div>
        <label htmlFor={nameId} className="eyebrow mb-3 block">
          Name
        </label>
        <TextInput
          id={nameId}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="your name"
          autoComplete="name"
        />
      </div>
      <div>
        <label htmlFor={emailId} className="eyebrow mb-3 block">
          Email
        </label>
        <TextInput
          id={emailId}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="you@email.com"
          autoComplete="email"
          aria-invalid={touched && !emailValid}
        />
      </div>
      <div>
        <label htmlFor={phoneId} className="eyebrow mb-3 block">
          Phone <span className="lowercase tracking-normal text-muted/60">(optional)</span>
        </label>
        <TextInput
          id={phoneId}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91..."
          autoComplete="tel"
        />
      </div>
    </div>
  );
}

function BookingScheduler({
  brief,
  estimate,
  onBooked,
}: {
  brief: Brief;
  estimate: Estimate | null;
  onBooked: () => void;
}) {
  const startingDate = initialDate();
  const [date, setDate] = useState(startingDate);
  const availableSlots = useMemo(() => slotsFor(date), [date]);
  const [time, setTime] = useState(availableSlots[0]?.value ?? "");
  const [name, setName] = useState(brief.contact?.name ?? "");
  const [email, setEmail] = useState(brief.contact?.email ?? "");
  const [phone, setPhone] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mobileStep, setMobileStep] = useState<BookingStep>("date");
  const [booked, setBooked] = useState<{ date: string; time: string } | null>(
    null
  );

  const emailValid = EMAIL_RE.test(email.trim());

  useEffect(() => {
    if (!availableSlots.some((slot) => slot.value === time)) {
      setTime(availableSlots[0]?.value ?? "");
    }
  }, [availableSlots, time]);

  const submit = async () => {
    setTouched(true);
    setError("");

    if (!emailValid) {
      setError("Add a valid email so we know where to confirm the call.");
      return;
    }

    if (!date || !time) {
      setError("Choose a date and time for the call.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          time,
          timezone: TIME_ZONE,
          contact: {
            email: email.trim(),
            name: name.trim() || undefined,
            phone: phone.trim() || undefined,
          },
          brief,
          estimate,
        }),
      });
      const data = (await res.json()) as {
        booking?: { date: string; time: string };
        error?: string;
      };

      if (!res.ok || !data.booking) {
        throw new Error(data.error || "Could not book that call right now.");
      }

      setBooked({ date: data.booking.date, time: data.booking.time });
      onBooked();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (booked) {
    return (
      <div className="mt-8 rounded-lg bg-accent/[0.05] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
          <div>
            <p className="font-sans text-base font-medium text-foreground">
              Call booked for {prettyDate(booked.date)} at {slotLabel(booked.time)}.
            </p>
            <p className="mt-2 text-sm font-light leading-relaxed text-muted">
              It is saved in your admin page. We will use {email.trim()} for the
              follow-up.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const bookingButton = (
    <Button
      className="w-full sm:w-auto"
      size="lg"
      onClick={submit}
      disabled={loading || !availableSlots.length}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
          booking
        </>
      ) : (
        <>
          <CalendarClock className="h-5 w-5" strokeWidth={1.75} />
          Book call
        </>
      )}
    </Button>
  );

  return (
    <div className="mt-8 flex flex-col gap-8 lg:gap-9">
      <div>
        <p className="eyebrow">Schedule the call</p>
        <p className="mt-2 text-sm font-light text-muted">
          Open every day, 2–6 PM IST.
        </p>
      </div>

      <div className="lg:hidden">
        {mobileStep === "date" && (
          <div>
            <CalendarPicker value={date} onChange={setDate} />
            <Button
              className="mt-8 w-full"
              size="lg"
              onClick={() => setMobileStep("time")}
            >
              next: choose time
            </Button>
          </div>
        )}

        {mobileStep === "time" && (
          <div>
            <div className="flex items-baseline justify-between gap-4">
              <p className="eyebrow">Choose time</p>
              <p className="text-xs font-light text-muted/70">30 min slots</p>
            </div>
            <div className="mt-5">
              <TimeSlotPicker
                availableSlots={availableSlots}
                time={time}
                onChange={setTime}
              />
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <Button variant="ghost" onClick={() => setMobileStep("date")}>
                back
              </Button>
              <Button onClick={() => setMobileStep("details")}>
                next: details
              </Button>
            </div>
          </div>
        )}

        {mobileStep === "details" && (
          <div>
            <div className="mb-6 flex items-center justify-between gap-4">
              <p className="eyebrow">Your details</p>
              <button
                type="button"
                onClick={() => setMobileStep("time")}
                className="text-xs font-medium uppercase tracking-[0.16em] text-muted transition-colors hover:text-foreground"
              >
                back to time
              </button>
            </div>
            <ContactFields
              idPrefix="mobile-call"
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              phone={phone}
              setPhone={setPhone}
              touched={touched}
              setTouched={setTouched}
            />
          </div>
        )}
      </div>

      <div className="hidden gap-9 lg:grid lg:grid-cols-[auto_1fr] lg:gap-14">
        <CalendarPicker value={date} onChange={setDate} />

        <div>
          <div className="flex items-baseline justify-between gap-4">
            <p className="eyebrow">Time</p>
            <p className="text-xs font-light text-muted/70">30 min slots</p>
          </div>
          <div className="mt-5">
            {availableSlots.length ? (
              <TimeSlotPicker
                availableSlots={availableSlots}
                time={time}
                onChange={setTime}
              />
            ) : (
              <p className="body-muted text-sm">
                Today is full. Pick another date.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="hidden lg:block">
        <p className="eyebrow mb-6">Your details</p>
        <ContactFields
          idPrefix="desktop-call"
          name={name}
          setName={setName}
          email={email}
          setEmail={setEmail}
          phone={phone}
          setPhone={setPhone}
          touched={touched}
          setTouched={setTouched}
        />
      </div>

      {error && <p className="text-sm font-light text-accent">{error}</p>}

      <div className="hidden lg:block">{bookingButton}</div>
      {mobileStep === "details" && <div className="lg:hidden">{bookingButton}</div>}
    </div>
  );
}

export function Step8Close() {
  const { brief, estimate, goTo } = usePath();
  const router = useRouter();
  const [showScheduler, setShowScheduler] = useState(false);
  const [booked, setBooked] = useState(false);
  const isSimple = estimate?.tier === "simple";
  const simpleTimeline = estimate?.timeline?.trim() || "";
  const hasTwentyFourHourPromise = /24\s*hour/i.test(simpleTimeline);

  return (
    <StepShell innerClassName="max-w-3xl">
      <Reveal blur y={24} duration={0.7}>
        <h2 className="headline text-balance">less talk. more done.</h2>
      </Reveal>

      {isSimple ? (
        <Reveal className="mt-10" delay={0.2}>
          <p className="font-display text-3xl font-semibold tracking-tight text-accent sm:text-4xl">
            delivered in {hasTwentyFourHourPromise ? "24 hours" : simpleTimeline}.
          </p>
          <p className="body-muted mt-3">
            {hasTwentyFourHourPromise
              ? "show up, brief us, we deliver."
              : "we will keep the scope tight and the timing honest."}
          </p>
        </Reveal>
      ) : (
        estimate && (
          <Reveal className="mt-10" delay={0.2}>
            <p className="font-display text-2xl font-medium text-foreground sm:text-3xl">
              Realistic timeline:{" "}
              <span className="text-accent">{estimate.timeline}</span>.
            </p>
            <p className="body-muted mt-3">
              No fairy-tale deadlines - milestones we actually hit.
            </p>
          </Reveal>
        )
      )}

      <Reveal className="mt-12" delay={0.35}>
        {!showScheduler && (
          <Button
            size="lg"
            variant="primary"
            onClick={() => setShowScheduler(true)}
          >
            <CalendarClock className="h-5 w-5" strokeWidth={1.75} />
            Schedule a call
          </Button>
        )}
        {showScheduler && (
          <BookingScheduler
            brief={brief}
            estimate={estimate ?? null}
            onBooked={() => setBooked(true)}
          />
        )}
      </Reveal>

      {booked && (
        <Reveal className="mt-14" delay={0.1}>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <Button variant="link" onClick={() => goTo(0)}>
              <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
              start over
            </Button>
            <Button variant="link" onClick={() => router.push("/game")}>
              <Gamepad2 className="h-4 w-4" strokeWidth={1.5} />
              play a quick game
            </Button>
          </div>
        </Reveal>
      )}
    </StepShell>
  );
}
