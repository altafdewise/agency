import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/ui/PageShell";

export interface LegalSection {
  id: string;
  title: string;
  body: React.ReactNode;
}

/** A plain-language legal page: title, effective date, contents, sections. */
export function LegalDoc({
  eyebrow,
  title,
  updated,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  intro: React.ReactNode;
  sections: LegalSection[];
}) {
  return (
    <PageShell className="max-w-2xl">
      <Link
        href="/legal"
        className="inline-flex items-center gap-2 text-sm font-light text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        legal
      </Link>

      <article className="mt-10">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="headline-md mt-4 text-balance">{title}</h1>
        <p className="mt-5 font-mono text-xs uppercase tracking-[0.14em] text-muted">
          Effective {updated}
        </p>

        <div className="mt-10 text-base font-light leading-relaxed text-muted">{intro}</div>

        <nav aria-label="Contents" className="mt-10 border-y border-border py-6">
          <ol className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            {sections.map((section, i) => (
              <li key={section.id} className="flex gap-3">
                <span className="font-mono text-xs tabular-nums text-muted/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <a href={`#${section.id}`} className="text-foreground/85 transition-colors hover:text-accent">
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {sections.map((section, i) => (
          <section key={section.id} id={section.id} className="mt-14 scroll-mt-28">
            <h2 className="flex items-baseline gap-3 font-display text-2xl font-semibold tracking-tight text-foreground">
              <span className="font-mono text-xs font-normal tabular-nums text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              {section.title}
            </h2>
            <div className="text-base font-light leading-relaxed text-muted [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 [&_li]:mt-2 [&_p]:mt-4 [&_strong]:font-medium [&_strong]:text-foreground [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5">
              {section.body}
            </div>
          </section>
        ))}
      </article>
    </PageShell>
  );
}
