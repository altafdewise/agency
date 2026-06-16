import { cn } from "@/lib/cn";

export function StatCard({
  label,
  value,
  note,
  tone = "default",
}: {
  label: string;
  value: string;
  note?: string;
  tone?: "default" | "accent" | "good";
}) {
  return (
    <div className="rounded-lg border border-border bg-[#141414]/72 p-5">
      <p className="eyebrow">{label}</p>
      <p
        className={cn(
          "mt-4 font-display text-4xl font-semibold leading-none tracking-tightest",
          tone === "accent"
            ? "text-accent"
            : tone === "good"
              ? "text-emerald-300"
              : "text-foreground"
        )}
      >
        {value}
      </p>
      {note && <p className="mt-3 text-xs font-light text-muted">{note}</p>}
    </div>
  );
}
