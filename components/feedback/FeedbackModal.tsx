"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

const MAX_CHARS = 2000;
const CLOSE_AFTER_MS = 1600;

type Status = "idle" | "sending" | "done" | "error";

/**
 * Anonymous feedback modal — one open text area, no identifying fields. Submits
 * to /api/feedback and shows a quiet confirmation before closing.
 *
 * Rendered via a portal so it escapes the section's overflow/stacking context.
 * Entrance is animated; on close we simply unmount (AnimatePresence exit is
 * unreliable in this React 19 + Next 15 stack — see maggie-build-gotchas).
 */
export function FeedbackModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Portals need a DOM target — only render after mount (avoids SSR mismatch).
  useEffect(() => setMounted(true), []);

  // Reset transient state each time the modal opens, and manage focus.
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    setMessage("");
    setStatus("idle");
    setError("");
    const id = window.setTimeout(() => textareaRef.current?.focus(), 60);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(id);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  const submit = async () => {
    const trimmed = message.trim();
    if (!trimmed || status === "sending") return;
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "Could not send that just now.");
      }
      setStatus("done");
      window.setTimeout(onClose, CLOSE_AFTER_MS);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  if (!mounted || !open) return null;

  const remaining = MAX_CHARS - message.length;
  const done = status === "done";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Send anonymous feedback"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
    >
      <motion.button
        type="button"
        aria-label="Close feedback"
        onClick={onClose}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 cursor-default bg-background/80 backdrop-blur-md"
      />

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: reduce ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-lg rounded-2xl border border-border bg-[#0A0A0A] p-7 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] sm:p-9"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full text-muted transition-colors hover:text-foreground"
        >
          <X className="h-5 w-5" strokeWidth={1.6} />
        </button>

        {done ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
            <p className="font-display text-3xl font-semibold tracking-tightest text-foreground">
              got it.
            </p>
            <p className="mt-3 text-base font-light text-muted">thank you.</p>
          </div>
        ) : (
          <>
            <p className="eyebrow">anonymous</p>
            <h2 className="mt-4 font-display text-3xl font-semibold leading-tight tracking-tightest text-foreground sm:text-4xl">
              tell us what&rsquo;s
              <br />
              not working.
            </h2>

            <textarea
              ref={textareaRef}
              value={message}
              maxLength={MAX_CHARS}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                  submit();
                }
              }}
              placeholder="say anything. we read all of it."
              rows={6}
              className="mt-6 w-full resize-none rounded-xl border border-border bg-foreground/[0.03] p-4 text-base font-light leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted/70 focus:border-accent"
            />

            <div className="mt-3 flex items-center justify-between gap-4">
              <span
                className={`text-xs ${remaining < 80 ? "text-accent" : "text-muted/70"}`}
              >
                {remaining} characters left
              </span>
              <button
                type="button"
                onClick={submit}
                disabled={!message.trim() || status === "sending"}
                className="inline-flex items-center rounded-full bg-accent px-6 py-3 text-sm font-medium text-background transition-transform duration-200 hover:scale-[1.03] focus-visible:scale-[1.03] active:scale-95 disabled:pointer-events-none disabled:opacity-40"
              >
                {status === "sending" ? "sending…" : "send"}
              </button>
            </div>

            {status === "error" && (
              <p className="mt-3 text-sm text-accent">{error}</p>
            )}
          </>
        )}
      </motion.div>
    </div>,
    document.body
  );
}
