"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { usePath } from "@/components/PathProvider";
import { TOTAL_STEPS } from "@/lib/brief";
import { PERSONA_STAGES } from "@/lib/content";
import { tick } from "@/lib/haptics";
import { cn } from "@/lib/cn";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const GUIDE_FIRST_STEP = 1; // Step 2 is where the hero dot lands on the rail.
const TIMELINE_STEP = 2; // Step 3 owns scroll-linked sub-progress.
const GUIDE_DENOM = TOTAL_STEPS - GUIDE_FIRST_STEP - 1;
const DOT_SIZE = 10;
const HANDOFF_MS = 800;

interface Handoff {
  from: { x: number; y: number };
  to: { x: number; y: number };
}

interface Pulse {
  id: number;
  pct: number;
  kind: "step" | "stage";
}

function guidePct(step: number, subProgress = 0) {
  const sub = step === TIMELINE_STEP ? clamp01(subProgress) : 0;
  return clamp01((step - GUIDE_FIRST_STEP + sub) / GUIDE_DENOM) * 100;
}

export function Progress() {
  const { step, goTo, subProgress, brief } = usePath();
  const reduce = useReducedMotion();
  const [railHeight, setRailHeight] = useState(1);
  const [handoff, setHandoff] = useState<Handoff | null>(null);
  const [guideIntroduced, setGuideIntroduced] = useState(false);
  const [pulse, setPulse] = useState<Pulse | null>(null);
  const [activeStage, setActiveStage] = useState(0);
  const [completionKey, setCompletionKey] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);
  const prevStepRef = useRef(step);
  const stepRef = useRef(step);
  const pulseIdRef = useRef(0);
  const stageRef = useRef(0);

  const pct = useSpring(guidePct(step), {
    stiffness: 60,
    damping: 18,
    mass: 0.8,
  });
  const dotY = useTransform(pct, (v) => clamp01(v / 100) * railHeight);
  const trailScale = useTransform(pct, (v) => clamp01(v / 100));

  stepRef.current = step;
  const showGuide = step > 0;
  const showRailDot =
    showGuide && (reduce || guideIntroduced || step > GUIDE_FIRST_STEP) && !handoff;
  const timelineStages = PERSONA_STAGES[brief.persona];
  const showStageMarkers = Boolean(timelineStages) && step >= TIMELINE_STEP;

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const measure = () => setRailHeight(el.getBoundingClientRect().height || 1);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const triggerPulse = useCallback(
    (pctValue: number, kind: Pulse["kind"] = "step") => {
      if (reduce) return;
      const id = pulseIdRef.current + 1;
      pulseIdRef.current = id;
      setPulse({ id, pct: pctValue, kind });
      window.setTimeout(() => {
        setPulse((current) => (current?.id === id ? null : current));
      }, 760);
    },
    [reduce]
  );

  useEffect(() => {
    if (!handoff || reduce) return;
    const timer = window.setTimeout(() => {
      setHandoff(null);
      setGuideIntroduced(true);
      triggerPulse(0);
    }, HANDOFF_MS + 120);
    return () => window.clearTimeout(timer);
  }, [handoff, reduce, triggerPulse]);

  useEffect(() => {
    const previous = prevStepRef.current;
    const target = guidePct(step);
    stageRef.current = 0;
    setActiveStage(0);

    if (reduce) {
      pct.jump(target);
      if (step > 0) setGuideIntroduced(true);
    } else {
      pct.set(target);
      if (step > 0 && previous !== step) triggerPulse(target);
      if (previous !== TOTAL_STEPS - 1 && step === TOTAL_STEPS - 1) {
        setCompletionKey((key) => key + 1);
      }
      if (previous === 0 && step > 0 && !guideIntroduced) {
        const source = document.querySelector<HTMLElement>("[data-guiding-dot-source='true']");
        const rail = railRef.current;
        if (source && rail) {
          const sourceRect = source.getBoundingClientRect();
          const railRect = rail.getBoundingClientRect();
          setHandoff({
            from: {
              x: sourceRect.left + sourceRect.width / 2 - DOT_SIZE / 2,
              y: sourceRect.top + sourceRect.height / 2 - DOT_SIZE / 2,
            },
            to: {
              x: railRect.left + railRect.width / 2 - DOT_SIZE / 2,
              y: railRect.top - DOT_SIZE / 2,
            },
          });
        } else {
          setGuideIntroduced(true);
        }
      }
    }

    prevStepRef.current = step;
  }, [guideIntroduced, pct, reduce, step, triggerPulse]);

  useMotionValueEvent(subProgress, "change", (v) => {
    const currentStep = stepRef.current;
    const nextPct = guidePct(currentStep, v);
    if (reduce) {
      pct.jump(nextPct);
      return;
    }

    pct.set(nextPct);
    if (currentStep !== TIMELINE_STEP) return;

    const stageCount = timelineStages?.length ?? 1;
    const stage = Math.round(clamp01(v) * (stageCount - 1));
    if (stage !== stageRef.current) {
      stageRef.current = stage;
      setActiveStage(stage);
      tick(); // dot reached a new timeline stage
      triggerPulse(guidePct(currentStep, stage / Math.max(1, stageCount - 1)), "stage");
    }
  });

  const stageStart = guidePct(TIMELINE_STEP);
  const stageSpan = guidePct(TIMELINE_STEP, 1) - stageStart;

  return (
    <>
      <div className="pointer-events-none fixed left-[5px] top-1/2 z-50 block -translate-y-1/2 sm:left-6">
        <motion.div
          className="relative"
          initial={false}
          animate={{ opacity: showGuide ? 1 : 0 }}
          transition={{ duration: reduce ? 0 : 0.28, ease: "easeOut" }}
        >
          <div
            ref={railRef}
            className="relative h-[36vh] w-px bg-foreground/12 sm:h-[42vh] sm:bg-foreground/15"
            data-guiding-rail
          >
            <div className="absolute left-1/2 top-0 h-full w-4 -translate-x-1/2 sm:w-7" aria-hidden>
              <div className="absolute left-1/2 top-0 h-full w-[3px] -translate-x-1/2 sm:w-[7px]">
                <motion.div
                  className="h-full w-full origin-top rounded-full blur-[4px] sm:blur-md"
                  style={{
                    scaleY: trailScale,
                    background:
                      "linear-gradient(to bottom, rgba(255,68,56,0) 0%, rgba(242,238,227,0.12) 62%, rgba(242,238,227,0.38) 84%, rgba(255,68,56,0.68) 100%)",
                  }}
                />
              </div>
              <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2">
                <motion.div
                  className="h-full w-full origin-top rounded-full"
                  data-guiding-trail="persistent"
                  style={{
                    scaleY: trailScale,
                    background:
                      "linear-gradient(to bottom, rgba(255,68,56,0) 0%, rgba(242,238,227,0.2) 58%, rgba(242,238,227,0.72) 88%, rgba(255,68,56,0.95) 100%)",
                  }}
                />
              </div>
              {completionKey > 0 && !reduce && (
                <div className="absolute left-1/2 top-0 h-full w-[10px] -translate-x-1/2">
                  <motion.div
                    key={completionKey}
                    className="h-full w-full rounded-full blur-md"
                    style={{
                      background:
                        "linear-gradient(to bottom, rgba(255,68,56,0) 0%, rgba(242,238,227,0.2) 45%, rgba(255,68,56,0.75) 100%)",
                    }}
                    initial={{ opacity: 0, scaleX: 0.7 }}
                    animate={{ opacity: [0, 0.75, 0], scaleX: [0.7, 1.5, 1] }}
                    transition={{ duration: 1.15, ease: "easeInOut" }}
                  />
                </div>
              )}
            </div>

            {showStageMarkers &&
              timelineStages?.map((stage, i) => {
                const t =
                  stageStart + (stageSpan * i) / Math.max(1, timelineStages.length - 1);
                const visited = step > TIMELINE_STEP || i <= activeStage;
                return (
                  <span
                    key={stage.key}
                    className={cn(
                      "absolute left-1/2 hidden h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-300 sm:block",
                      visited
                        ? "bg-accent/70 shadow-[0_0_8px_rgba(255,68,56,0.45)]"
                        : "bg-foreground/20"
                    )}
                    style={{ top: `${t}%` }}
                    aria-hidden
                  />
                );
              })}

            {Array.from({ length: TOTAL_STEPS - GUIDE_FIRST_STEP }).map((_, i) => {
              const stepIndex = i + GUIDE_FIRST_STEP;
              const t = (i / GUIDE_DENOM) * 100;
              const active = stepIndex === step;
              const visited = stepIndex < step;
              return (
                <button
                  key={stepIndex}
                  type="button"
                  onClick={() => visited && goTo(stepIndex)}
                  aria-label={`Step ${stepIndex + 1}`}
                  aria-current={active ? "step" : undefined}
                  tabIndex={visited ? 0 : -1}
                  className={cn(
                    "absolute left-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-300 sm:h-1.5 sm:w-1.5",
                    visited
                      ? "pointer-events-auto cursor-pointer bg-foreground/50 hover:bg-foreground"
                      : active
                        ? "bg-accent/80 shadow-[0_0_7px_rgba(255,68,56,0.45)] sm:shadow-[0_0_10px_rgba(255,68,56,0.5)]"
                        : "bg-foreground/20"
                  )}
                  style={{ top: `${t}%` }}
                />
              );
            })}

            {pulse && showGuide && (
              <span
                className="absolute left-1/2 h-0 w-0"
                style={{ top: `${pulse.pct}%` }}
                aria-hidden
              >
                <span className="block h-3 w-3 -translate-x-1/2 -translate-y-1/2 sm:h-3.5 sm:w-3.5">
                  <motion.span
                    key={pulse.id}
                    className={cn(
                      "block h-full w-full rounded-full border",
                      pulse.kind === "stage" ? "border-foreground/55" : "border-accent/65"
                    )}
                    initial={{ opacity: 0.7, scale: 0.4 }}
                    animate={{ opacity: 0, scale: 2.2 }}
                    transition={{ duration: 0.72, ease: "easeOut" }}
                  />
                </span>
              </span>
            )}

            {showRailDot && (
              <motion.div className="absolute left-1/2 top-0 h-0 w-0" style={{ y: dotY }}>
                <span className="block h-2 w-2 -translate-x-1/2 -translate-y-1/2 sm:h-2.5 sm:w-2.5">
                  <motion.span
                    className="block h-full w-full rounded-full bg-accent"
                    data-guiding-dot
                    animate={
                      reduce
                        ? undefined
                        : {
                            scale: [1, 1.13, 1],
                            boxShadow: [
                              "0 0 7px 1px rgba(255,68,56,0.45)",
                              "0 0 11px 2px rgba(255,68,56,0.62)",
                              "0 0 7px 1px rgba(255,68,56,0.45)",
                            ],
                          }
                    }
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                      boxShadow: "0 0 7px 1px rgba(255,68,56,0.45)",
                    }}
                  />
                </span>
              </motion.div>
            )}
          </div>

          <div className="mt-4 hidden font-mono text-[0.65rem] tracking-widest text-muted/70 sm:block">
            <span className="text-foreground">{String(step + 1).padStart(2, "0")}</span>
            <span className="text-muted/40"> / {String(TOTAL_STEPS).padStart(2, "0")}</span>
          </div>
        </motion.div>
      </div>

      {handoff && (
        <motion.div
          className="pointer-events-none fixed left-0 top-0 z-[70] h-2.5 w-2.5 rounded-full"
          initial={{
            x: handoff.from.x,
            y: handoff.from.y,
            backgroundColor: "rgb(242,238,227)",
            boxShadow: "0 0 14px 3px rgba(242,238,227,0.42)",
          }}
          animate={{
            x: handoff.to.x,
            y: handoff.to.y,
            backgroundColor: "rgb(255,68,56)",
            boxShadow: "0 0 16px 4px rgba(255,68,56,0.68)",
          }}
          transition={{ duration: HANDOFF_MS / 1000, ease: [0.42, 0, 0.58, 1] }}
          onAnimationComplete={() => {
            setHandoff(null);
            setGuideIntroduced(true);
            triggerPulse(0);
          }}
          aria-hidden
        />
      )}
    </>
  );
}
