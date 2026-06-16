import { cn } from "@/lib/cn";

/** Shared wrapper for the static pages (about, blog, legal): clears the fixed
 *  nav, constrains width, keeps the generous whitespace of the flow. */
export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className="relative min-h-[100dvh] w-full px-6 pb-28 pt-28 sm:px-10 sm:pt-32">
      <div className={cn("mx-auto w-full max-w-3xl", className)}>{children}</div>
    </main>
  );
}
