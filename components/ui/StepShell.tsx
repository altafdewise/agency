import { cn } from "@/lib/cn";

interface StepShellProps {
  eyebrow?: string;
  className?: string;
  /** Constrain inner content width; defaults to the path max width. */
  innerClassName?: string;
  children: React.ReactNode;
}

/**
 * The shared canvas for every step: a full-height, vertically-centred column
 * with generous breathing room. Tall content (card grids on mobile) extends
 * past the fold and scrolls naturally from the top.
 */
export function StepShell({
  eyebrow,
  className,
  innerClassName,
  children,
}: StepShellProps) {
  return (
    <section
      className={cn(
        "flex min-h-[100dvh] w-full flex-col justify-center px-6 py-28 sm:px-10 sm:py-24",
        className
      )}
    >
      <div className={cn("mx-auto w-full max-w-path", innerClassName)}>
        {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
        {children}
      </div>
    </section>
  );
}
