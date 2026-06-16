"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { usePath } from "@/components/PathProvider";
import { Ambient } from "@/components/Ambient";
import { Progress } from "@/components/Progress";
import { Step1Needs } from "@/components/steps/Step1Needs";
import { Step2Persona } from "@/components/steps/Step2Persona";
import { Step3Stage } from "@/components/steps/Step3Stage";
import { Step4Work } from "@/components/steps/Step4Work";
import { Step5Brief } from "@/components/steps/Step5Brief";
import { Step6Contact } from "@/components/steps/Step6Contact";
import { Step7Estimate } from "@/components/steps/Step7Estimate";
import { Step8Close } from "@/components/steps/Step8Close";

const STEPS = [
  Step1Needs,
  Step2Persona,
  Step3Stage,
  Step4Work,
  Step5Brief,
  Step6Contact,
  Step7Estimate,
  Step8Close,
];

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const EASE_IN = [0.64, 0, 0.78, 0] as const;
const EXIT_MS = 400;

/**
 * Sequential step transitions ("wait" behaviour): the outgoing panel fades +
 * drifts up (ease-in, 400ms); once it's gone the incoming panel rises from
 * below + fades in (ease-out, 500ms) — one panel gracefully replacing another.
 *
 * Implemented by hand rather than with AnimatePresence mode="wait", which fails
 * to complete its exit under React 19 + Next 15 here (the next panel never
 * mounts). This produces the identical motion, deterministically.
 */
export function Path() {
  const { step, back } = usePath();
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(step);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (step === shown) return;
    if (reduce) {
      setShown(step);
      window.scrollTo(0, 0);
      return;
    }
    setExiting(true);
    const t = setTimeout(() => {
      setShown(step);
      setExiting(false);
      window.scrollTo(0, 0);
    }, EXIT_MS);
    return () => clearTimeout(t);
  }, [step, shown, reduce]);

  const Current = STEPS[shown];

  return (
    <main className="relative min-h-[100dvh] w-full">
      <Ambient />
      <Progress />

      {/* Back affordance — persistent, above the scenes. */}
      <div className="pointer-events-none fixed inset-0 z-50">
        {step > 0 && (
          <button
            type="button"
            onClick={back}
            className="pointer-events-auto absolute left-5 top-5 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-muted transition-colors duration-200 hover:text-foreground sm:left-8 sm:top-8"
            aria-label="Go back a step"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
          </button>
        )}
      </div>

      <motion.div
        key={shown}
        initial={reduce ? false : { opacity: 0, y: 40 }}
        animate={
          exiting
            ? { opacity: 0, y: -30, transition: { duration: EXIT_MS / 1000, ease: EASE_IN } }
            : { opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.5, ease: EASE_OUT } }
        }
      >
        <Current />
      </motion.div>
    </main>
  );
}
