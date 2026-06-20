"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, MessageSquareWarning, Send, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";

const MAX_CHARS = 1200;

const FEEDBACK_TYPES = [
  {
    key: "issue",
    label: "Issue",
    placeholder: "what broke? don't hold back.",
  },
  {
    key: "feedback",
    label: "Feedback",
    placeholder: "tell us how we're doing — be honest.",
  },
  {
    key: "concern",
    label: "Concern",
    placeholder: "something on your mind? lay it out.",
  },
] as const;

type FeedbackType = (typeof FEEDBACK_TYPES)[number]["key"];
type Status = "idle" | "sending" | "done" | "error";

export function AnonymousFeedbackSection() {
  const reduce = useReducedMotion();
  const [type, setType] = useState<FeedbackType | null>(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const remaining = MAX_CHARS - message.length;
  const canSend = message.trim().length >= 8 && status !== "sending";
  const revealed = type !== null;

  const activeType = useMemo(
    () => FEEDBACK_TYPES.find((item) => item.key === type),
    [type]
  );

  const submit = async () => {
    const trimmed = message.trim();
    if (!canSend || !trimmed || !activeType) return;

    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: activeType.label, message: trimmed }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "Could not send that just now.");
      }

      setStatus("done");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <section
      id="anonymous-feedback"
      aria-label="Anonymous feedback"
      className="relative w-full overflow-hidden py-16 sm:py-24 lg:py-28"
    >
      <div className="mx-auto w-full max-w-path px-6 sm:px-10">
        <div className="mx-auto max-w-xl text-center">
          <p className="eyebrow">Anonymous feedback</p>
          <h2 className="headline-md mt-4 text-balance">
            say what needs saying.
          </h2>
          <p className="body-muted mx-auto mt-4 max-w-md">
            No names. No follow-up. Just the note.
          </p>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 22, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: reduce ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-9 max-w-xl sm:mt-10"
        >
          <div className="rounded-3xl border border-foreground/[0.07] bg-foreground/[0.015] p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-foreground/[0.09] bg-foreground/[0.03] text-accent">
                  <MessageSquareWarning className="h-[18px] w-[18px]" strokeWidth={1.5} />
                </span>
                <p className="text-[0.95rem] font-medium leading-none text-foreground">
                  private note
                </p>
              </div>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-foreground/[0.09] bg-foreground/[0.02] text-muted">
                <ShieldCheck className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </span>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-2.5">
              {FEEDBACK_TYPES.map((item) => {
                const selected = item.key === type;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setType(item.key);
                      if (status === "done") setStatus("idle");
                    }}
                    className={cn(
                      "min-h-[44px] rounded-full border px-2.5 py-2.5 text-center transition-colors duration-200",
                      selected
                        ? "border-accent bg-accent/[0.08] text-foreground"
                        : "border-foreground/[0.1] bg-transparent text-muted hover:border-foreground/[0.22] hover:text-foreground"
                    )}
                    aria-pressed={selected}
                  >
                    <span className="block text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {!revealed && (
              <p className="mt-6 text-center text-sm font-light text-muted/55">
                pick one to start.
              </p>
            )}

            {revealed && (
              <motion.div
                initial={reduce ? false : { height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                transition={{ duration: reduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: reduce ? 0 : 0.28,
                    ease: [0.22, 1, 0.36, 1],
                    delay: reduce ? 0 : 0.04,
                  }}
                  className="mt-6"
                >
                  <div className="relative">
                    <textarea
                      value={message}
                      maxLength={MAX_CHARS}
                      onChange={(event) => {
                        setMessage(event.target.value);
                        if (status === "done") setStatus("idle");
                      }}
                      onKeyDown={(event) => {
                        if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                          void submit();
                        }
                      }}
                      rows={5}
                      className="relative w-full resize-none rounded-2xl border border-foreground/[0.1] bg-background/40 p-4 text-base font-light leading-relaxed text-foreground outline-none transition-[border-color,background-color] duration-200 focus:border-accent/70 focus:bg-background/55"
                    />

                    {message.length === 0 && activeType && (
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-4 top-4 text-base font-light leading-relaxed text-muted/60"
                      >
                        <motion.span
                          key={activeType.key}
                          className="block"
                          initial={reduce ? false : { opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: reduce ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
                        >
                          {activeType.placeholder}
                        </motion.span>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p
                      className={cn(
                        "text-xs font-light",
                        remaining < 80 ? "text-accent" : "text-muted/70"
                      )}
                    >
                      {status === "done"
                        ? "sent. thank you."
                        : remaining < 120
                          ? `${remaining} left`
                          : ""}
                    </p>

                    <button
                      type="button"
                      onClick={() => void submit()}
                      disabled={!canSend}
                      className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-accent px-7 py-2.5 text-sm font-semibold text-background transition-[transform,filter] duration-200 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 active:scale-[0.98] disabled:pointer-events-none disabled:bg-accent/[0.18] disabled:text-background/55"
                    >
                      {status === "done" ? (
                        <>
                          Sent
                          <Check className="h-4 w-4" strokeWidth={1.8} />
                        </>
                      ) : (
                        <>
                          {status === "sending" ? "Sending" : "Send"}
                          <Send className="h-4 w-4" strokeWidth={1.8} />
                        </>
                      )}
                    </button>
                  </div>

                  {status === "error" && (
                    <p className="mt-3 text-sm text-accent">{error}</p>
                  )}
                </motion.div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
