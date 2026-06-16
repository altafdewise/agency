"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import { StepShell } from "@/components/ui/StepShell";
import { OptionCard } from "@/components/ui/OptionCard";
import { Button } from "@/components/ui/Button";
import { Reveal, RevealGroup } from "@/components/ui/Reveal";
import { usePath } from "@/components/PathProvider";
import {
  GOALS,
  PERSONA_STAGES,
  PROXY_GOALS,
  type Goal,
  type Stage,
} from "@/lib/content";

export function Step3Stage() {
  const { brief } = usePath();
  const reduce = useReducedMotion();
  const stages = PERSONA_STAGES[brief.persona];

  if (brief.persona === "for-someone") {
    return <GoalSelect goals={PROXY_GOALS} proxy />;
  }

  if (brief.persona === "looking") {
    return <LookingAround />;
  }

  if (!stages) {
    return <GoalSelect goals={GOALS} />;
  }

  return reduce ? <StageList stages={stages} /> : <StageTimeline stages={stages} />;
}

function GoalSelect({ goals, proxy = false }: { goals: Goal[]; proxy?: boolean }) {
  const { update, next, brief } = usePath();
  const choose = (key: string) => {
    update({ stage: key });
    next();
  };

  return (
    <StepShell eyebrow={proxy ? "A little more context" : "Where you're at"}>
      <Reveal blur y={24} duration={0.7}>
        <h2 className="headline-md max-w-3xl text-balance">
          {proxy ? "what do they need?" : "what's your goal?"}
        </h2>
      </Reveal>
      <RevealGroup
        className="mt-12 grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
        stagger={0.08}
        delay={0.3}
      >
        {goals.map((g) => (
          <Reveal key={g.key}>
            <OptionCard
              title={g.label}
              Icon={g.Icon}
              selected={brief.stage === g.key}
              onClick={() => choose(g.key)}
            />
          </Reveal>
        ))}
      </RevealGroup>
    </StepShell>
  );
}

function LookingAround() {
  const { update, next } = usePath();

  useEffect(() => {
    update({ stage: "explore" });
  }, [update]);

  return (
    <StepShell eyebrow="No pressure" innerClassName="max-w-2xl">
      <Reveal blur y={24} duration={0.7}>
        <h2 className="headline-md text-balance">take a look around.</h2>
      </Reveal>
      <Reveal className="mt-6" delay={0.2}>
        <p className="body-muted max-w-xl">
          We&apos;ll skip the stage question and show you the kind of work this path leads to.
        </p>
      </Reveal>
      <Reveal className="mt-10" delay={0.35}>
        <Button withArrow onClick={next}>
          show me the work
        </Button>
      </Reveal>
    </StepShell>
  );
}

function StageList({ stages }: { stages: Stage[] }) {
  const { update, next, brief } = usePath();
  const choose = (key: string) => {
    update({ stage: key });
    next();
  };

  return (
    <StepShell eyebrow="Where you're at">
      <h2 className="headline-md max-w-3xl text-balance">where are you now?</h2>
      <div className="mt-12 grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
        {stages.map((s) => (
          <OptionCard
            key={s.key}
            title={s.title}
            blurb={s.blurb}
            selected={brief.stage === s.key}
            onClick={() => choose(s.key)}
          />
        ))}
      </div>
    </StepShell>
  );
}

function StageTimeline({ stages }: { stages: Stage[] }) {
  const { update, next, subProgress } = usePath();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: scrollerRef });
  const [active, setActive] = useState(0);
  const N = stages.length;

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    subProgress.set(v);
    setActive(Math.round(v * (N - 1)));
  });

  useEffect(() => () => subProgress.set(0), [subProgress]);

  const select = (key: string) => {
    update({ stage: key });
    next();
  };

  const hintOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);

  return (
    <div ref={scrollerRef} className="no-scrollbar h-[100dvh] overflow-y-auto overscroll-contain">
      <div className="relative" style={{ height: `${N * 100}vh` }}>
        <div className="sticky top-0 flex h-[100dvh] items-center justify-center overflow-hidden px-6">
          <p className="eyebrow absolute left-1/2 top-12 -translate-x-1/2 sm:top-16">
            where are you now?
          </p>

          {stages.map((s, i) => (
            <ScrollStage
              key={s.key}
              stage={s}
              index={i}
              total={N}
              active={i === active}
              progress={scrollYProgress}
              onSelect={() => select(s.key)}
            />
          ))}

          <motion.div
            className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center"
            style={{ opacity: hintOpacity }}
          >
            <span className="flex items-center gap-2 text-muted">
              <ArrowDown className="h-4 w-4 animate-bounce" strokeWidth={1.5} />
              <span className="eyebrow">scroll</span>
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ramp(c: number, w: number, edgeLo: number, mid: number, edgeHi: number) {
  const lo = c - w;
  const hi = c + w;
  const input: number[] = [];
  const output: number[] = [];
  if (lo > 0.0001) {
    input.push(0, lo);
    output.push(edgeLo, edgeLo);
  }
  input.push(Math.max(0, Math.min(1, c)));
  output.push(mid);
  if (hi < 0.9999) {
    input.push(hi, 1);
    output.push(edgeHi, edgeHi);
  }
  return { input, output };
}

function ScrollStage({
  stage,
  index,
  total,
  active,
  progress,
  onSelect,
}: {
  stage: Stage;
  index: number;
  total: number;
  active: boolean;
  progress: MotionValue<number>;
  onSelect: () => void;
}) {
  const c = total > 1 ? index / (total - 1) : 0;
  const seg = total > 1 ? 1 / (total - 1) : 1;
  const op = ramp(c, seg * 0.55, 0, 1, 0);
  const sc = ramp(c, seg, 0.82, 1, 0.82);
  const ty = ramp(c, seg, 70, 0, -70);
  const opacity = useTransform(progress, op.input, op.output);
  const scale = useTransform(progress, sc.input, sc.output);
  const y = useTransform(progress, ty.input, ty.output);

  return (
    <motion.div
      style={{ opacity, scale, y, pointerEvents: active ? "auto" : "none" }}
      className="absolute inset-0 flex items-center justify-center px-6"
    >
      <button
        type="button"
        onClick={onSelect}
        tabIndex={active ? 0 : -1}
        aria-hidden={!active}
        className="group flex max-w-2xl cursor-pointer flex-col items-start rounded-2xl text-left"
      >
        <span className="font-mono text-sm text-accent">{stage.index}</span>
        <h2 className="headline mt-4">{stage.title}</h2>
        <p className="body-muted mt-6 max-w-xl">{stage.blurb}</p>
        <span className="mt-10 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-foreground/25 px-6 text-sm font-medium text-foreground transition-colors duration-200 ease-out group-hover:border-accent/50">
          this is me
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1"
            strokeWidth={1.75}
          />
        </span>
      </button>
    </motion.div>
  );
}
