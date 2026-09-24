"use client";

import { useRef } from "react";
import {
  motion,
  type MotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { VOID_PIPELINE } from "@/lib/portfolio";
import { usePortfolioMobile } from "@/lib/use-portfolio-mobile";
import { fadeIn, fadeInOut, fadeOut } from "@/lib/portfolio-motion";
import { cn } from "@/lib/cn";
import { MobileStorySequence } from "./MobileStorySequence";
import { StoryChapter } from "./StoryChapter";
import { StoryReveal } from "./StoryReveal";
import styles from "./portfolio.module.css";

function VoidSystem({ progress }: { progress?: MotionValue<number> }) {
  return (
    <div className={styles.voidSystem}>
      <div className={styles.voidSystemHeader}>
        <div>
          <p className={styles.voidLabel}>AI cybersecurity project</p>
          <h2>VOID</h2>
        </div>
        <p>
          A cybersecurity copilot concept built around retrieval, reasoning,
          memory, and controlled security-tool integration.
        </p>
      </div>

      <div className={styles.voidPipeline}>
        <div className={styles.voidTrack} aria-hidden>
          {progress ? <motion.span style={{ scaleX: progress }} /> : <span />}
        </div>
        <ol>
          {VOID_PIPELINE.map((stage) => (
            <li key={stage.index}>
              <span className={styles.voidNode}>{stage.index}</span>
              <strong>{stage.title}</strong>
              <p>{stage.detail}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className={styles.voidFooter}>
        <p>Python · LLMs · RAG</p>
        <p>Linux · Nmap · Wireshark</p>
      </div>
    </div>
  );
}

export function VoidChapter() {
  const chapterRef = useRef<HTMLElement>(null);
  const reduce = Boolean(useReducedMotion());
  const mobile = usePortfolioMobile();
  const { scrollYProgress } = useScroll({
    target: chapterRef,
    offset: ["start start", "end end"],
  });

  const thoughtOpacity = useTransform(scrollYProgress, (value) =>
    fadeOut(value, 0.12, 0.22)
  );
  const questionOpacity = useTransform(scrollYProgress, (value) =>
    fadeInOut(value, 0.17, 0.28, 0.4, 0.5)
  );
  const questionScale = useTransform(scrollYProgress, [0.17, 0.4], [0.95, 1]);
  const revealOpacity = useTransform(scrollYProgress, (value) =>
    fadeInOut(value, 0.45, 0.56, 0.65, 0.73)
  );
  const revealScale = useTransform(scrollYProgress, [0.45, 0.68], [0.86, 1]);
  const systemOpacity = useTransform(scrollYProgress, (value) =>
    fadeIn(value, 0.68, 0.79)
  );
  const systemY = useTransform(scrollYProgress, [0.68, 0.84], [65, 0]);
  const pipelineProgress = useTransform(scrollYProgress, [0.76, 0.98], [0, 1]);

  if (reduce || mobile) {
    return (
      <StoryChapter
        ref={chapterRef}
        id="void"
        index="05"
        label="VOID"
        className={cn(styles.reducedChapter, styles.voidChapter)}
      >
        <div className={styles.reducedStory}>
          {mobile && !reduce ? (
            <MobileStorySequence beats={[
              <>Then I <em>thought…</em></>,
              <>Why not build <em>my own?</em></>,
            ]} />
          ) : (
            <StoryReveal>
              <h2 className={cn(styles.reducedTitle, styles.darkReducedTitle)}>
                Then I thought…
                <em>Why not build my own?</em>
              </h2>
            </StoryReveal>
          )}
          <VoidSystem />
        </div>
      </StoryChapter>
    );
  }

  return (
    <StoryChapter
      ref={chapterRef}
      id="void"
      index="05"
      label="VOID"
      className={styles.voidChapter}
    >
      <div className={styles.stickyStage}>
        <motion.p className={styles.voidSentence} style={{ opacity: thoughtOpacity }}>
          Then I thought…
        </motion.p>

        <motion.p
          className={styles.voidSentence}
          style={{ opacity: questionOpacity, scale: questionScale }}
        >
          Why not build <em>my own?</em>
        </motion.p>

        <motion.div
          className={styles.voidReveal}
          style={{ opacity: revealOpacity, scale: revealScale }}
          aria-label="VOID, an AI cybersecurity project"
        >
          <span>AI cybersecurity project</span>
          <strong>VOID</strong>
          <p>Retrieval. Reasoning. Memory. Controlled tools.</p>
        </motion.div>

        <motion.div
          className={styles.voidSystemScene}
          style={{ opacity: systemOpacity, y: systemY }}
        >
          <VoidSystem progress={pipelineProgress} />
        </motion.div>
      </div>
    </StoryChapter>
  );
}
