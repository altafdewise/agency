"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowDown } from "lucide-react";
import { PORTFOLIO_ROLES } from "@/lib/portfolio";
import { fadeIn, fadeInOut, fadeOut } from "@/lib/portfolio-motion";
import { MediaFrame } from "./MediaFrame";
import { StoryChapter } from "./StoryChapter";
import styles from "./portfolio.module.css";

function AltafPortrait() {
  return (
    <Image
      src="/portrait.jpeg"
      alt="Mohammad Altaf"
      fill
      sizes="(max-width: 640px) 35vw, (max-width: 900px) 40vw, 24rem"
      className={styles.portraitImage}
    />
  );
}

export function CuriosityChapter() {
  const chapterRef = useRef<HTMLElement>(null);
  const reduce = Boolean(useReducedMotion());
  const { scrollYProgress } = useScroll({
    target: chapterRef,
    offset: ["start start", "end end"],
  });

  const openingOpacity = useTransform(scrollYProgress, (value) =>
    fadeOut(value, 0.2, 0.29)
  );
  const openingY = useTransform(scrollYProgress, [0.2, 0.29], [0, -56]);
  const curiosityOpacity = useTransform(scrollYProgress, (value) =>
    fadeInOut(value, 0.24, 0.34, 0.47, 0.56)
  );
  const curiosityY = useTransform(
    scrollYProgress,
    [0.24, 0.34, 0.47, 0.56],
    [46, 0, 0, -46]
  );
  const buildingOpacity = useTransform(scrollYProgress, (value) =>
    fadeInOut(value, 0.51, 0.61, 0.7, 0.78)
  );
  const buildingScale = useTransform(scrollYProgress, [0.51, 0.7], [0.96, 1]);
  const identityOpacity = useTransform(scrollYProgress, (value) =>
    fadeIn(value, 0.72, 0.82)
  );
  const identityY = useTransform(scrollYProgress, [0.72, 0.86], [70, 0]);
  const mediaY = useTransform(scrollYProgress, [0.72, 1], [90, -10]);
  const promptOpacity = useTransform(scrollYProgress, (value) =>
    fadeOut(value, 0.08, 0.18)
  );

  if (reduce) {
    return (
      <StoryChapter
        ref={chapterRef}
        id="curiosity"
        index="01"
        label="Curiosity"
        className={styles.reducedChapter}
      >
        <div className={styles.reducedStory}>
          <p>I never really picked one thing.</p>
          <p>I just kept getting curious.</p>
          <p>So I kept building.</p>
          <div className={styles.reducedIdentity}>
            <div>
              <p className={styles.identityEyebrow}>Meet the person behind Maggie</p>
              <h1 className={styles.identityName}>
                Mohammad
                <span>Altaf.</span>
              </h1>
              <p className={styles.roles}>{PORTFOLIO_ROLES.join(" · ")}</p>
            </div>
            <MediaFrame
              label="Mohammad Altaf"
              index="01 / 01"
              ratio="portrait"
            >
              <AltafPortrait />
            </MediaFrame>
          </div>
        </div>
      </StoryChapter>
    );
  }

  return (
    <StoryChapter
      ref={chapterRef}
      id="curiosity"
      index="01"
      label="Curiosity"
      className={styles.curiosityChapter}
    >
      <div className={styles.stickyStage}>
        <motion.p
          className={styles.storySentence}
          style={{ opacity: openingOpacity, y: openingY }}
        >
          I never really picked <em>one thing.</em>
        </motion.p>

        <motion.p
          className={styles.storySentence}
          style={{ opacity: curiosityOpacity, y: curiosityY }}
        >
          I just kept getting <em>curious.</em>
        </motion.p>

        <motion.p
          className={styles.storySentence}
          style={{ opacity: buildingOpacity, scale: buildingScale }}
        >
          So I kept <em>building.</em>
        </motion.p>

        <motion.div
          className={styles.identityScene}
          style={{ opacity: identityOpacity, y: identityY }}
        >
          <motion.div className={styles.identityMedia} style={{ y: mediaY }}>
            <MediaFrame
              label="Mohammad Altaf"
              index="01 / 01"
              ratio="portrait"
            >
              <AltafPortrait />
            </MediaFrame>
          </motion.div>

          <div className={styles.identityCopy}>
            <p className={styles.identityEyebrow}>Meet the person behind Maggie</p>
            <h1 className={styles.identityName}>
              Mohammad
              <span>Altaf.</span>
            </h1>
            <ul className={styles.roleList} aria-label="Creative disciplines and interests">
              {PORTFOLIO_ROLES.map((role, index) => (
                <li key={role}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {role}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        <motion.div
          className={styles.scrollPrompt}
          style={{ opacity: promptOpacity }}
          aria-hidden
        >
          <span>Scroll to begin</span>
          <ArrowDown size={14} strokeWidth={1.5} />
        </motion.div>
      </div>
    </StoryChapter>
  );
}
