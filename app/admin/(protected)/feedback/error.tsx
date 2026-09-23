"use client";

import { useEffect } from "react";

export default function FeedbackError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin/feedback] render failed:", error);
  }, [error]);

  return (
    <section className="rounded-lg border border-border bg-[#141414]/72 p-8">
      <p className="eyebrow">Feedback</p>
      <h1 className="mt-5 font-display text-3xl text-foreground">
        Something went wrong while loading this data.
      </h1>
      <p className="mt-3 text-sm text-muted">Please try again in a moment.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-7 border border-border px-5 py-2 text-sm text-foreground transition-colors hover:border-accent hover:text-accent"
      >
        Retry
      </button>
    </section>
  );
}
