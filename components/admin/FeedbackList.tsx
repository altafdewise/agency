import type { Feedback } from "@/lib/feedback";

function formatWhen(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function splitFeedbackMessage(message: string) {
  const match = message.match(/^\[([^\]]+)]\n([\s\S]*)$/);
  if (!match) return { kind: "Note", body: message };
  return { kind: match[1], body: match[2].trim() };
}

/** Read-only, newest-first list of anonymous feedback messages. */
export function FeedbackList({ items }: { items: Feedback[] }) {
  if (!items.length) {
    return (
      <div className="grid min-h-56 place-items-center rounded-lg border border-border bg-[#141414]/72 p-8 text-center">
        <div>
          <p className="font-display text-2xl text-foreground">no feedback yet.</p>
          <p className="mt-2 text-sm text-muted">
            Anonymous issue reports and feedback will land here, newest first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {items.map((item) => {
        const parsed = splitFeedbackMessage(item.message);

        return (
          <li
            key={item.id}
            className="rounded-lg border border-border bg-[#141414]/72 p-5"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="rounded-full border border-accent/25 bg-accent/[0.08] px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-accent">
                {parsed.kind}
              </span>
              <span className="text-xs uppercase tracking-[0.18em] text-muted">
                anonymous
              </span>
            </div>
            <p className="whitespace-pre-wrap text-[0.95rem] font-light leading-relaxed text-foreground">
              {parsed.body}
            </p>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-muted">
              {formatWhen(item.createdAt)}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
