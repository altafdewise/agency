"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { useMotionValue, type MotionValue } from "framer-motion";
import {
  EMPTY_BRIEF,
  SHOW_CASE_STUDIES,
  TOTAL_STEPS,
  type Brief,
  type Estimate,
} from "@/lib/brief";
import { tick } from "@/lib/haptics";
import { trackFunnelEvent } from "@/lib/analytics-client";
import { sessionGet, sessionSet } from "@/lib/safe-storage";

interface PathContextValue {
  brief: Brief;
  step: number; // 0-indexed
  direction: number; // 1 forward, -1 back (drives transition drift)
  /** The step was restored (refresh, coming back to the page) rather than walked,
   *  so the panel swaps in without the outgoing exit animation. */
  instant: boolean;
  /** The estimate for the current answers, or null once any of them change. */
  estimate: Estimate | null;
  setEstimate: (e: Estimate | null) => void;
  /** The lead this visit was saved as. It outlives the estimate, so re-pricing
   *  changed answers updates that lead instead of adding another. */
  leadId?: string;
  setLeadId: (id: string | undefined) => void;
  /** 0..1 sub-progress within a step (Step 3 scroll) — drives the rail fill. */
  subProgress: MotionValue<number>;
  update: (patch: Partial<Brief>) => void;
  goTo: (step: number) => void;
  next: () => void;
  back: () => void;
}

const PathContext = createContext<PathContextValue | null>(null);

/** The step a rendered panel belongs to (set by <Path>). A panel that is still
 *  on screen after the step moved on — it is fading out — can't navigate, so a
 *  double click can never skip the step that is coming in. */
export const PanelStepContext = createContext<number | null>(null);

const HOME = "/";
const STORE_KEY = "zev_path";
const BRIEF_STEP = SHOW_CASE_STUDIES ? 4 : 3;
const noop = () => {};

type SavedEstimate = { estimate: Estimate; key: string };

/** The answers an estimate is priced from. Contact details don't change the price. */
function estimateKey(brief: Brief) {
  return JSON.stringify([
    [...brief.needs].sort(),
    brief.customNeed?.trim() ?? "",
    brief.persona,
    brief.customPersona?.trim() ?? "",
    brief.stage,
    brief.description.trim(),
  ]);
}

function clampStep(step: number) {
  return Math.max(0, Math.min(TOTAL_STEPS - 1, step));
}

/** The furthest step these answers can stand on, so a restored step never
 *  lands past a question that hasn't been answered. */
function furthestStep(brief: Brief) {
  if (!brief.needs.length) return 0;
  if (!brief.persona) return 1;
  if (!brief.stage) return 2;
  if (!brief.description.trim()) return BRIEF_STEP;
  return TOTAL_STEPS - 1;
}

function stepFromUrl() {
  const raw = new URLSearchParams(window.location.search).get("step");
  const n = raw ? Number.parseInt(raw, 10) : 1;
  return Number.isFinite(n) ? clampStep(n - 1) : 0;
}

/** Steps live in the URL (`/?step=3`), so back/forward and refresh keep them. */
function urlForStep(step: number) {
  const params = new URLSearchParams(window.location.search);
  if (step > 0) params.set("step", String(step + 1));
  else params.delete("step");
  const query = params.toString();
  return `${window.location.pathname}${query ? `?${query}` : ""}`;
}

/** Each history entry we write remembers the steps walked to reach it, so the
 *  in-app back button can walk the real history instead of forking it. */
function readTrail(state: unknown): number[] | null {
  if (!state || typeof state !== "object") return null;
  const trail = (state as { zevTrail?: unknown }).zevTrail;
  if (!Array.isArray(trail) || !trail.length) return null;
  return trail.every((n) => Number.isInteger(n)) ? (trail as number[]) : null;
}

function isBrief(value: unknown): value is Brief {
  if (!value || typeof value !== "object") return false;
  const b = value as Record<string, unknown>;
  return (
    Array.isArray(b.needs) &&
    b.needs.every((need) => typeof need === "string") &&
    typeof b.persona === "string" &&
    typeof b.stage === "string" &&
    typeof b.description === "string" &&
    (b.contact === null || typeof b.contact === "object")
  );
}

function readSaved(): { brief: Brief; saved: SavedEstimate | null; leadId?: string } | null {
  try {
    const raw = JSON.parse(sessionGet(STORE_KEY) || "null") as Record<string, unknown> | null;
    if (!raw || raw.v !== 1 || !isBrief(raw.brief)) return null;
    const saved = raw.saved as SavedEstimate | null;
    return {
      brief: { ...EMPTY_BRIEF, ...raw.brief },
      saved:
        saved && typeof saved.key === "string" && saved.estimate && typeof saved.estimate === "object"
          ? saved
          : null,
      leadId: typeof raw.leadId === "string" ? raw.leadId : undefined,
    };
  } catch {
    return null;
  }
}

export function usePath(): PathContextValue {
  const ctx = useContext(PathContext);
  const panelStep = useContext(PanelStepContext);
  if (!ctx) throw new Error("usePath must be used within <PathProvider>");
  if (panelStep !== null && panelStep !== ctx.step) {
    return { ...ctx, goTo: noop, next: noop, back: noop };
  }
  return ctx;
}

export function PathProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [brief, setBrief] = useState<Brief>(EMPTY_BRIEF);
  const [nav, setNav] = useState({ step: 0, direction: 1, instant: false });
  const [saved, setSaved] = useState<SavedEstimate | null>(null);
  const [leadId, setLeadId] = useState<string | undefined>();
  const subProgress = useMotionValue(0);
  const stepRef = useRef(0);
  const briefRef = useRef(brief);
  const restoredRef = useRef(false);
  briefRef.current = brief;

  const key = estimateKey(brief);
  const estimate = saved && saved.key === key ? saved.estimate : null;

  const setEstimate = useCallback((next: Estimate | null) => {
    setSaved(next ? { estimate: next, key: estimateKey(briefRef.current) } : null);
  }, []);

  const update = useCallback((patch: Partial<Brief>) => {
    setBrief((b) => ({ ...b, ...patch }));
  }, []);

  /** Puts a step on screen. History is handled by the caller. */
  const showStep = useCallback(
    (target: number, mode: "walk" | "history" | "restore") => {
      const current = stepRef.current;
      if (target === current) return;
      stepRef.current = target;
      subProgress.set(0); // leaving a step resets its sub-progress
      if (mode !== "restore") tick(); // subtle confirm on step change
      if (mode !== "restore" && target > current) {
        trackFunnelEvent(`step_${current + 1}`, "completed");
        trackFunnelEvent(`step_${target + 1}`, "entered");
      }
      setNav({ step: target, direction: target > current ? 1 : -1, instant: mode === "restore" });
    },
    [subProgress]
  );

  // Kept in sessionStorage so a refresh or a return visit in the same tab picks
  // up where the visitor left off. Declared before the restore below so the
  // empty first render never overwrites what is saved.
  useEffect(() => {
    if (!restoredRef.current) return;
    sessionSet(STORE_KEY, JSON.stringify({ v: 1, brief, saved, leadId }));
  }, [brief, saved, leadId]);

  // Arriving on the home page: restore saved answers once, then line the step
  // on screen up with the URL.
  useEffect(() => {
    let answers = briefRef.current;
    if (!restoredRef.current) {
      restoredRef.current = true;
      const stored = readSaved();
      if (stored) {
        answers = stored.brief;
        setBrief(stored.brief);
        setSaved(stored.saved);
        setLeadId(stored.leadId);
      }
    }
    if (pathname !== HOME) return;

    const urlStep = stepFromUrl();
    const hasStepInUrl = new URLSearchParams(window.location.search).has("step");
    // A step in the URL comes from a refresh or back/forward, so it wins. A
    // plain "/" is a fresh arrival: keep whatever step the visitor was on.
    const target = hasStepInUrl ? Math.min(urlStep, furthestStep(answers)) : stepRef.current;
    showStep(target, "restore");
    if (target !== urlStep || !readTrail(window.history.state)) {
      window.history.replaceState({ zevTrail: [target] }, "", urlForStep(target));
    }
    trackFunnelEvent(`step_${target + 1}`, "entered");
  }, [pathname, showStep]);

  // Browser back/forward between steps.
  useEffect(() => {
    const onPopState = () => {
      if (window.location.pathname !== HOME) return;
      const urlStep = stepFromUrl();
      const target = Math.min(urlStep, furthestStep(briefRef.current));
      if (target !== urlStep) {
        // Forward onto a step whose question has since been cleared: stop at it.
        const trail = readTrail(window.history.state) ?? [urlStep];
        window.history.replaceState({ zevTrail: [...trail.slice(0, -1), target] }, "", urlForStep(target));
      }
      showStep(target, "history");
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [showStep]);

  const goTo = useCallback(
    (target: number) => {
      const current = stepRef.current;
      const clamped = clampStep(target);
      if (clamped === current) return;

      if (window.location.pathname === HOME) {
        const trail = readTrail(window.history.state) ?? [current];
        if (clamped < current) {
          const index = trail.lastIndexOf(clamped);
          if (index !== -1 && index < trail.length - 1) {
            // Walk the real history back; the popstate puts the step on screen.
            window.history.go(index - (trail.length - 1));
            return;
          }
        }
        window.history.pushState({ zevTrail: [...trail, clamped] }, "", urlForStep(clamped));
      }
      showStep(clamped, "walk");
    },
    [showStep]
  );

  const next = useCallback(() => goTo(stepRef.current + 1), [goTo]);

  const back = useCallback(() => {
    if (stepRef.current === 0) return;
    const trail = window.location.pathname === HOME ? readTrail(window.history.state) : null;
    // Same as the browser's back button, so the two never disagree.
    if (trail && trail.length > 1) window.history.back();
    else goTo(stepRef.current - 1);
  }, [goTo]);

  const value = useMemo(
    () => ({
      brief,
      step: nav.step,
      direction: nav.direction,
      instant: nav.instant,
      estimate,
      setEstimate,
      leadId,
      setLeadId,
      subProgress,
      update,
      goTo,
      next,
      back,
    }),
    [brief, nav, estimate, setEstimate, leadId, subProgress, update, goTo, next, back]
  );

  return <PathContext.Provider value={value}>{children}</PathContext.Provider>;
}
