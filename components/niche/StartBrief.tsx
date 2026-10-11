"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { usePath } from "@/components/PathProvider";
import { cn } from "@/lib/cn";

/** The estimator's stage question (Step 3): the first one a landing page
 *  hasn't already answered. */
const STAGE_STEP = 2;

/**
 * Opens the estimator with "website" and "I run a business" already picked and
 * the brief started, so a local business owner lands on the next question
 * instead of starting from the top. Anything they've already written is kept.
 */
export function StartBrief({
  starter,
  children,
  className,
}: {
  starter: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { brief, update, goTo } = usePath();

  const start = () => {
    update({
      needs: ["website"],
      customNeed: undefined,
      persona: "business",
      customPersona: undefined,
      // A stage answered for another kind of visitor doesn't apply any more.
      ...(brief.persona === "business" ? {} : { stage: "" }),
      ...(brief.description.trim() ? {} : { description: starter }),
    });
    // Set the step before the home page mounts, so it never flashes step one.
    goTo(STAGE_STEP);
  };

  return (
    <Link
      href={`/?step=${STAGE_STEP + 1}`}
      onClick={start}
      className={cn(
        "group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-accent px-8 text-base font-medium tracking-tight text-background transition-[filter] duration-200 hover:brightness-110 active:brightness-95",
        className
      )}
    >
      {children}
      <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out-soft group-hover:translate-x-1" strokeWidth={1.75} />
    </Link>
  );
}
