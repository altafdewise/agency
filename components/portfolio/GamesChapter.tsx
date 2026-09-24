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
import { GAME_PROJECTS, GAME_SKILL_GROUPS } from "@/lib/portfolio";
import { fadeIn, fadeInOut, fadeOut } from "@/lib/portfolio-motion";
import { usePortfolioMobile } from "@/lib/use-portfolio-mobile";
import { StoryChapter } from "./StoryChapter";
import { StoryReveal } from "./StoryReveal";
import { ViewportVideo } from "./ViewportVideo";
import styles from "./portfolio.module.css";

function GameProjectSlide({
  title,
  index,
  progress,
  mobile,
}: {
  title: string;
  index: number;
  progress: MotionValue<number>;
  mobile: boolean;
}) {
  const start = 0.16 + index * 0.12;
  const visibleAt = start + 0.045;
  const fadeAt = start + 0.085;
  const end = start + 0.125;
  const last = index === GAME_PROJECTS.length - 1;
  const [videoActive, setVideoActive] = useState(false);
  const opacity = useTransform(progress, (value) =>
    last
      ? fadeIn(value, start, visibleAt)
      : fadeInOut(value, start, visibleAt, fadeAt, end)
  );
  const y = useTransform(progress, [start, visibleAt, end], [70, 0, -45]);
  const mobileOpacity = useTransform(progress, (value) => {
    if (value < start) return 0;
    if (last) return 1;
    return value < end ? 1 : 0;
  });

  useMotionValueEvent(progress, "change", (value) => {
    const activeUntil = last ? 0.86 : end;
    const nextVideoActive = value >= start && value < activeUntil;
    setVideoActive((current) =>
      current === nextVideoActive ? current : nextVideoActive
    );
  });

  return (
    <motion.article
      className={styles.gameProjectSlide}
      style={{
        opacity: mobile ? mobileOpacity : opacity,
        y: mobile ? 0 : y,
      }}
      aria-label={`${title}, Unity project`}
    >
      <div className={styles.gameProjectCopy}>
        <p>Unity project · {String(index + 1).padStart(2, "0")}</p>
        <h2>{title}</h2>
        <span>Unity 3D · C#</span>
      </div>
      <div className={styles.gameProjectMedia}>
        <div className={styles.gameVisual}>
          <ViewportVideo
            src={`/designs/${index + 5}.g.mp4`}
            label={`${title} gameplay footage`}
            active={videoActive}
          />
        </div>
        <p>Gameplay footage</p>
      </div>
    </motion.article>
  );
}

function GameSkills() {
  return (
    <div className={styles.gameSkills}>
      <div>
        <p className={styles.chapterKicker}>Building playable worlds</p>
        <h2>Systems, spaces, and a little chaos.</h2>
      </div>
      <div className={styles.gameSkillGrid}>
        {GAME_SKILL_GROUPS.map((group, index) => (
          <div key={group.label}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{group.label}</strong>
            <p>{group.items}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GamesChapter() {
  const chapterRef = useRef<HTMLElement>(null);
  const reduce = Boolean(useReducedMotion());
  const mobile = usePortfolioMobile();
  const { scrollYProgress } = useScroll({
    target: chapterRef,
    offset: ["start start", "end end"],
  });

  const introOpacity = useTransform(scrollYProgress, (value) =>
    fadeOut(value, 0.1, 0.17)
  );
  const introY = useTransform(scrollYProgress, [0.1, 0.17], [0, -50]);
  const skillsOpacity = useTransform(scrollYProgress, (value) =>
    fadeIn(value, 0.82, 0.91)
  );
  const skillsY = useTransform(scrollYProgress, [0.82, 0.95], [70, 0]);
  const mobileSkillsOpacity = useTransform(scrollYProgress, (value) =>
    value >= 0.86 ? 1 : 0
  );

  if (reduce) {
    return (
      <StoryChapter
        ref={chapterRef}
        id="games"
        index="06"
        label="Game development"
        className={styles.reducedChapter}
      >
        <div className={styles.reducedStory}>
          <StoryReveal>
            <h2 className={styles.reducedTitle}>
              And then I started <em>making games.</em>
            </h2>
          </StoryReveal>
          <ol className={styles.reducedGameList}>
            {GAME_PROJECTS.map((project, index) => (
              <li key={project}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{project}</strong>
                <small>Unity 3D · C#</small>
                <div className={styles.reducedGameMedia}>
                  <ViewportVideo src={`/designs/${index + 5}.g.mp4`} label={`${project} gameplay footage`} />
                </div>
              </li>
            ))}
          </ol>
          <GameSkills />
        </div>
      </StoryChapter>
    );
  }

  return (
    <StoryChapter
      ref={chapterRef}
      id="games"
      index="06"
      label="Game development"
      className={styles.gamesChapter}
    >
      <div className={styles.stickyStage}>
        <motion.div
          className={styles.gamesIntro}
          style={{ opacity: introOpacity, y: introY }}
        >
          <p className={styles.chapterKicker}>A different kind of system</p>
          <h2>And then I started <em>making games.</em></h2>
        </motion.div>

        <div className={styles.gameSlides}>
          {GAME_PROJECTS.map((project, index) => (
            <GameProjectSlide
              key={project}
              title={project}
              index={index}
              progress={scrollYProgress}
              mobile={mobile}
            />
          ))}
        </div>

        <motion.div
          className={styles.gameSkillsScene}
          style={{
            opacity: mobile ? mobileSkillsOpacity : skillsOpacity,
            y: mobile ? 0 : skillsY,
          }}
        >
          <GameSkills />
        </motion.div>
      </div>
    </StoryChapter>
  );
}
