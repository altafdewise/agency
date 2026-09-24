"use client";

import { useRef, useState } from "react";
import {
  motion,
  type MotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { fadeIn, fadeInOut } from "@/lib/portfolio-motion";
import { usePortfolioMobile } from "@/lib/use-portfolio-mobile";
import { MobileStorySequence } from "./MobileStorySequence";
import { StoryChapter } from "./StoryChapter";
import { StoryReveal } from "./StoryReveal";
import { ViewportVideo } from "./ViewportVideo";
import styles from "./portfolio.module.css";

const BUILD_STEPS = ["Idea", "Figma", "Code", "Product"] as const;
const DEVELOPMENT_TOOLS = ["HTML", "CSS", "JavaScript", "React", "Flutter"] as const;

function BuildProcess({ progress }: { progress?: MotionValue<number> }) {
  return (
    <div className={styles.buildProcess}>
      <div className={styles.processTrack} aria-hidden>
        {progress ? <motion.span style={{ scaleX: progress }} /> : <span />}
      </div>
      <ol>
        {BUILD_STEPS.map((step, index) => (
          <li key={step}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{step}</strong>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function DevelopmentChapter() {
  const chapterRef = useRef<HTMLElement>(null);
  const [processActive, setProcessActive] = useState(false);
  const reduce = Boolean(useReducedMotion());
  const mobile = usePortfolioMobile();
  const { scrollYProgress } = useScroll({
    target: chapterRef,
    offset: ["start start", "end end"],
  });

  const firstOpacity = useTransform(scrollYProgress, (value) =>
    fadeInOut(value, 0, 0.05, 0.18, 0.29)
  );
  const firstY = useTransform(scrollYProgress, [0.18, 0.29], [0, -50]);
  const secondOpacity = useTransform(scrollYProgress, (value) =>
    fadeInOut(value, 0.23, 0.34, 0.48, 0.59)
  );
  const secondScale = useTransform(scrollYProgress, [0.23, 0.48], [0.96, 1]);
  const processOpacity = useTransform(scrollYProgress, (value) =>
    fadeIn(value, 0.52, 0.65)
  );
  const processY = useTransform(scrollYProgress, [0.52, 0.72], [70, 0]);
  const processProgress = useTransform(scrollYProgress, [0.59, 0.94], [0, 1]);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const nextProcessActive = value > 0.52 && value <= 1;
    setProcessActive((current) =>
      current === nextProcessActive ? current : nextProcessActive
    );
  });

  if (reduce || mobile) {
    return (
      <StoryChapter
        ref={chapterRef}
        id="development"
        index="03"
        label="Development"
        className={styles.reducedChapter}
      >
        <div className={styles.reducedStory}>
          {mobile && !reduce ? (
            <MobileStorySequence beats={[
              <>Eventually, designing <em>wasn&apos;t enough.</em></>,
              <>So I started <em>building them.</em></>,
            ]} />
          ) : (
            <StoryReveal>
              <h2 className={styles.reducedTitle}>
                Eventually, designing wasn&apos;t enough.
                <em>So I started building them.</em>
              </h2>
            </StoryReveal>
          )}
          <BuildProcess />
          <div className={styles.interfaceSchematic}>
            <ViewportVideo src="/designs/4.mp4" label="Development project demonstration" />
          </div>
          <div className={styles.reducedDevelopmentCopy}>
            <p>
              The same idea could move from a blank frame in Figma to something
              responsive, interactive, and real.
            </p>
            <div className={styles.toolLine} aria-label="Development tools">
              {DEVELOPMENT_TOOLS.map((tool) => <span key={tool}>{tool}</span>)}
            </div>
          </div>
        </div>
      </StoryChapter>
    );
  }

  return (
    <StoryChapter
      ref={chapterRef}
      id="development"
      index="03"
      label="Development"
      className={styles.developmentChapter}
    >
      <div className={styles.stickyStage}>
        <motion.p
          className={styles.developmentSentence}
          style={{ opacity: firstOpacity, y: firstY }}
        >
          Eventually, designing <em>wasn&apos;t enough.</em>
        </motion.p>

        <motion.p
          className={styles.developmentSentence}
          style={{ opacity: secondOpacity, scale: secondScale }}
        >
          So I started <em>building them.</em>
        </motion.p>

        <motion.div
          className={styles.developmentProcessScene}
          style={{ opacity: processOpacity, y: processY }}
        >
          <div className={styles.developmentLead}>
            <p className={styles.chapterKicker}>From surface to system</p>
            <h2 className={styles.processTitle}>Idea to product.</h2>
            <p className={styles.processBody}>
              The same idea could move from a blank frame in Figma to something
              responsive, interactive, and real.
            </p>
          </div>

          <BuildProcess progress={processProgress} />

          <div className={styles.developmentProof}>
            <div className={styles.interfaceSchematic}>
              <ViewportVideo
                src="/designs/4.mp4"
                label="Development project demonstration"
                active={processActive}
              />
            </div>
            <div className={styles.developmentCopy}>
              <p>
                Design made the intent clear. HTML, CSS and JavaScript made it
                tangible. React and Flutter extended the same thinking into
                complete interfaces.
              </p>
              <div className={styles.toolLine} aria-label="Development tools">
                {DEVELOPMENT_TOOLS.map((tool) => <span key={tool}>{tool}</span>)}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </StoryChapter>
  );
}
