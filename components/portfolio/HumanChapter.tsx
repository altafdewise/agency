"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { fadeIn, fadeOut } from "@/lib/portfolio-motion";
import { usePortfolioMobile } from "@/lib/use-portfolio-mobile";
import { cn } from "@/lib/cn";
import { StoryChapter } from "./StoryChapter";
import { StoryReveal } from "./StoryReveal";
import styles from "./portfolio.module.css";

function BoxingArtwork() {
  return (
    <figure className={styles.boxingArtwork}>
      <div className={styles.boxingCanvas}>
        <Image
          src="/designs/box.jpg"
          alt="Boxer lacing a glove"
          fill
          sizes="(max-width: 640px) calc(100vw - 2.2rem), 58vw"
          className={styles.boxingImage}
        />
      </div>
      <figcaption>
        <span>Boxing photography</span>
      </figcaption>
    </figure>
  );
}

function BoxingScene() {
  return (
    <div className={styles.boxingScene}>
      <div className={styles.boxingCopy}>
        <p className={styles.chapterKicker}>The human part</p>
        <h2>I BOX.</h2>
        <p>Apparently getting punched is a hobby now.</p>
      </div>
      <BoxingArtwork />
    </div>
  );
}

export function HumanChapter() {
  const chapterRef = useRef<HTMLElement>(null);
  const reduce = Boolean(useReducedMotion());
  const mobile = usePortfolioMobile();
  const { scrollYProgress } = useScroll({
    target: chapterRef,
    offset: ["start start", "end end"],
  });

  const introOpacity = useTransform(scrollYProgress, (value) =>
    fadeOut(value, 0.2, 0.33)
  );
  const introY = useTransform(scrollYProgress, [0.2, 0.33], [0, -60]);
  const boxingOpacity = useTransform(scrollYProgress, (value) =>
    fadeIn(value, 0.31, 0.47)
  );
  const boxingScale = useTransform(scrollYProgress, [0.31, 0.62], [0.94, 1]);

  if (reduce || mobile) {
    return (
      <StoryChapter
        ref={chapterRef}
        id="human"
        index="08"
        label="The human part"
        className={cn(styles.reducedChapter, styles.humanChapter)}
      >
        <div className={styles.reducedStory}>
          <StoryReveal>
            <h2 className={styles.reducedTitle}>
              And when I&apos;m not doing any of that… <em>I box.</em>
            </h2>
          </StoryReveal>
          <div className={styles.reducedBoxingScene}>
            <BoxingScene />
          </div>
        </div>
      </StoryChapter>
    );
  }

  return (
    <StoryChapter
      ref={chapterRef}
      id="human"
      index="08"
      label="The human part"
      className={styles.humanChapter}
    >
      <div className={styles.stickyStage}>
        <motion.p
          className={styles.humanSentence}
          style={{ opacity: introOpacity, y: introY }}
        >
          And when I&apos;m not doing <em>any of that…</em>
        </motion.p>

        <motion.div
          className={styles.boxingSceneWrap}
          style={{ opacity: boxingOpacity, scale: boxingScale }}
        >
          <BoxingScene />
        </motion.div>
      </div>
    </StoryChapter>
  );
}
