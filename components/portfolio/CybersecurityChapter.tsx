"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { SECURITY_DISCIPLINES, SECURITY_TOOLS } from "@/lib/portfolio";
import { fadeIn, fadeInOut, fadeOut } from "@/lib/portfolio-motion";
import { cn } from "@/lib/cn";
import { StoryChapter } from "./StoryChapter";
import { StoryReveal } from "./StoryReveal";
import styles from "./portfolio.module.css";

function SecurityWorkspace() {
  return (
    <div className={styles.securityWorkspace}>
      <div className={styles.securityMap}>
        <Image
          src="/designs/cs_img.png"
          alt="Cybersecurity attack surface map"
          fill
          sizes="(max-width: 640px) calc(100vw - 2.2rem), 52vw"
          className={styles.securityMapImage}
        />
      </div>

      <div className={styles.securityNotes}>
        <p className={styles.darkKicker}>Look closer</p>
        <h2>Understand the system. Test the assumptions.</h2>
        <ul className={styles.securityDisciplineList}>
          {SECURITY_DISCIPLINES.map((discipline, index) => (
            <li key={discipline}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {discipline}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.securityToolLine} aria-label="Cybersecurity tools and platforms">
        {SECURITY_TOOLS.map((tool) => <span key={tool}>{tool}</span>)}
      </div>
    </div>
  );
}

export function CybersecurityChapter() {
  const chapterRef = useRef<HTMLElement>(null);
  const reduce = Boolean(useReducedMotion());
  const { scrollYProgress } = useScroll({
    target: chapterRef,
    offset: ["start start", "end end"],
  });

  const firstOpacity = useTransform(scrollYProgress, (value) =>
    fadeOut(value, 0.14, 0.24)
  );
  const firstY = useTransform(scrollYProgress, [0.14, 0.24], [0, -50]);
  const secondOpacity = useTransform(scrollYProgress, (value) =>
    fadeInOut(value, 0.2, 0.3, 0.45, 0.55)
  );
  const secondScale = useTransform(scrollYProgress, [0.2, 0.45], [0.96, 1]);
  const workspaceOpacity = useTransform(scrollYProgress, (value) =>
    fadeIn(value, 0.5, 0.63)
  );
  const workspaceY = useTransform(scrollYProgress, [0.5, 0.7], [70, 0]);

  if (reduce) {
    return (
      <StoryChapter
        ref={chapterRef}
        id="cybersecurity"
        index="04"
        label="Cybersecurity"
        className={cn(styles.reducedChapter, styles.cybersecurityChapter)}
      >
        <div className={styles.reducedStory}>
          <StoryReveal>
            <h2 className={cn(styles.reducedTitle, styles.darkReducedTitle)}>
              Then I got curious about what happens underneath.
              <em>So naturally… I started breaking things.</em>
            </h2>
          </StoryReveal>
          <SecurityWorkspace />
        </div>
      </StoryChapter>
    );
  }

  return (
    <StoryChapter
      ref={chapterRef}
      id="cybersecurity"
      index="04"
      label="Cybersecurity"
      className={styles.cybersecurityChapter}
    >
      <div className={styles.stickyStage}>
        <motion.p
          className={styles.cyberSentence}
          style={{ opacity: firstOpacity, y: firstY }}
        >
          Then I got curious about what happens <em>underneath.</em>
        </motion.p>

        <motion.p
          className={styles.cyberSentence}
          style={{ opacity: secondOpacity, scale: secondScale }}
        >
          So naturally… <em>I started breaking things.</em>
        </motion.p>

        <motion.div
          className={styles.securityWorkspaceScene}
          style={{ opacity: workspaceOpacity, y: workspaceY }}
        >
          <SecurityWorkspace />
        </motion.div>
      </div>
    </StoryChapter>
  );
}
