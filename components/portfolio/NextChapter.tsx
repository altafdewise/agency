"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { mailtoHref } from "@/lib/contact";
import { fadeIn, fadeInOut, fadeOut } from "@/lib/portfolio-motion";
import { usePortfolioMobile } from "@/lib/use-portfolio-mobile";
import { cn } from "@/lib/cn";
import { StoryChapter } from "./StoryChapter";
import styles from "./portfolio.module.css";

const LESSONS = [
  ["Design", "taught me to see."],
  ["Code", "taught me to build."],
  ["Cybersecurity", "taught me to question."],
  ["Boxing", "taught me to stay standing."],
] as const;

function ClosingLinks() {
  return (
    <div className={styles.closingLinks} aria-label="Get in touch and explore more">
      <a href={mailtoHref("Let's work together")} className={styles.closingLink}>
        <span>Work with me</span>
        <ArrowUpRight aria-hidden size={22} strokeWidth={1.5} />
      </a>
      <Link href="/" className={styles.closingLink}>
        <span>Maggie’s Agency</span>
        <ArrowUpRight aria-hidden size={22} strokeWidth={1.5} />
      </Link>
      <a
        href="https://github.com/altafdewise"
        className={styles.closingLink}
        target="_blank"
        rel="noreferrer"
      >
        <span>GitHub</span>
        <ArrowUpRight aria-hidden size={22} strokeWidth={1.5} />
      </a>
      <a href={mailtoHref("Portfolio enquiry")} className={styles.closingLink}>
        <span>Contact</span>
        <ArrowUpRight aria-hidden size={22} strokeWidth={1.5} />
      </a>
    </div>
  );
}

function ClosingScene() {
  return (
    <div className={styles.closingScene}>
      <div className={styles.closingStatement}>
        <p>I&apos;m still figuring out what&apos;s next.</p>
        <h2>That&apos;s the fun part.</h2>
      </div>
      <ClosingLinks />
      <p className={styles.closingColophon}>
        Designed and built by Mohammad Altaf · 2026
      </p>
    </div>
  );
}

export function NextChapter() {
  const chapterRef = useRef<HTMLElement>(null);
  const reduce = Boolean(useReducedMotion());
  const mobile = usePortfolioMobile();
  const { scrollYProgress } = useScroll({
    target: chapterRef,
    offset: ["start start", "end end"],
  });

  const introOpacity = useTransform(scrollYProgress, (value) =>
    fadeOut(value, 0.12, 0.22)
  );
  const introY = useTransform(scrollYProgress, [0.12, 0.22], [0, -60]);
  const lessonsOpacity = useTransform(scrollYProgress, (value) =>
    fadeInOut(value, 0.2, 0.3, 0.62, 0.72)
  );
  const lessonOne = useTransform(scrollYProgress, [0.25, 0.33], [42, 0]);
  const lessonTwo = useTransform(scrollYProgress, [0.33, 0.41], [42, 0]);
  const lessonThree = useTransform(scrollYProgress, [0.41, 0.49], [42, 0]);
  const lessonFour = useTransform(scrollYProgress, [0.49, 0.57], [42, 0]);
  const closingOpacity = useTransform(scrollYProgress, (value) =>
    fadeIn(value, 0.69, 0.8)
  );
  const closingY = useTransform(scrollYProgress, [0.69, 0.82], [70, 0]);
  const lessonOffsets = [lessonOne, lessonTwo, lessonThree, lessonFour];

  if (reduce || mobile) {
    return (
      <StoryChapter
        ref={chapterRef}
        id="next"
        index="09"
        label="What&apos;s next"
        className={cn(styles.reducedChapter, styles.nextChapter)}
      >
        <div className={styles.reducedStory}>
          <h2 className={styles.reducedTitle}>
            I don&apos;t really believe in having <em>one box.</em>
          </h2>
          <ol className={styles.reducedLessons}>
            {LESSONS.map(([subject, lesson]) => (
              <li key={subject}>
                <strong>{subject}</strong>
                <span>{lesson}</span>
              </li>
            ))}
          </ol>
          <ClosingScene />
        </div>
      </StoryChapter>
    );
  }

  return (
    <StoryChapter
      ref={chapterRef}
      id="next"
      index="09"
      label="What&apos;s next"
      className={styles.nextChapter}
    >
      <div className={styles.stickyStage}>
        <motion.p
          className={styles.nextSentence}
          style={{ opacity: introOpacity, y: introY }}
        >
          I don&apos;t really believe in having <em>one box.</em>
        </motion.p>

        <motion.ol className={styles.lessonList} style={{ opacity: lessonsOpacity }}>
          {LESSONS.map(([subject, lesson], index) => (
            <motion.li key={subject} style={{ x: lessonOffsets[index] }}>
              <strong>{subject}</strong>
              <span>{lesson}</span>
            </motion.li>
          ))}
        </motion.ol>

        <motion.div
          className={styles.closingSceneWrap}
          style={{ opacity: closingOpacity, y: closingY }}
        >
          <ClosingScene />
        </motion.div>
      </div>
    </StoryChapter>
  );
}
