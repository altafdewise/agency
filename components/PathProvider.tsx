"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useMotionValue, type MotionValue } from "framer-motion";
import { EMPTY_BRIEF, TOTAL_STEPS, type Brief, type Estimate } from "@/lib/brief";

interface PathContextValue {
  brief: Brief;
  step: number; // 0-indexed
  direction: number; // 1 forward, -1 back (drives transition drift)
  estimate: Estimate | null;
  setEstimate: (e: Estimate | null) => void;
  /** 0..1 sub-progress within a step (Step 3 scroll) — drives the rail fill. */
  subProgress: MotionValue<number>;
  update: (patch: Partial<Brief>) => void;
  goTo: (step: number) => void;
  next: () => void;
  back: () => void;
}

const PathContext = createContext<PathContextValue | null>(null);

const ESTIMATE_INPUT_KEYS: Array<keyof Brief> = [
  "needs",
  "customNeed",
  "persona",
  "customPersona",
  "stage",
  "description",
];

function affectsEstimate(patch: Partial<Brief>) {
  return ESTIMATE_INPUT_KEYS.some((key) =>
    Object.prototype.hasOwnProperty.call(patch, key)
  );
}

export function usePath(): PathContextValue {
  const ctx = useContext(PathContext);
  if (!ctx) throw new Error("usePath must be used within <PathProvider>");
  return ctx;
}

export function PathProvider({ children }: { children: React.ReactNode }) {
  const [brief, setBrief] = useState<Brief>(EMPTY_BRIEF);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const subProgress = useMotionValue(0);

  const update = useCallback((patch: Partial<Brief>) => {
    if (affectsEstimate(patch)) setEstimate(null);
    setBrief((b) => ({ ...b, ...patch }));
  }, []);

  const goTo = useCallback(
    (target: number) => {
      subProgress.set(0); // leaving a step resets its sub-progress
      setStep((current) => {
        const clamped = Math.max(0, Math.min(TOTAL_STEPS - 1, target));
        setDirection(clamped >= current ? 1 : -1);
        return clamped;
      });
    },
    [subProgress]
  );

  const next = useCallback(() => goTo(step + 1), [goTo, step]);
  const back = useCallback(() => goTo(step - 1), [goTo, step]);

  const value = useMemo(
    () => ({
      brief,
      step,
      direction,
      estimate,
      setEstimate,
      subProgress,
      update,
      goTo,
      next,
      back,
    }),
    [brief, step, direction, estimate, subProgress, update, goTo, next, back]
  );

  return <PathContext.Provider value={value}>{children}</PathContext.Provider>;
}
