"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  motion,
  type MotionValue,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { MAGGIE_PROJECTS, MAGGIE_SERVICES } from "@/lib/portfolio";
import { fadeIn, fadeInOut, fadeOut } from "@/lib/portfolio-motion";
import { usePortfolioMobile } from "@/lib/use-portfolio-mobile";
import { cn } from "@/lib/cn";
import { StoryChapter } from "./StoryChapter";
import { StoryReveal } from "./StoryReveal";
import styles from "./portfolio.module.css";

type MaggieProject = (typeof MAGGIE_PROJECTS)[number];

function MaggieMark() {
  return (
    <div className={styles.maggieMark} role="img" aria-label="Maggie’s Agency mark">
      <span className={styles.maggieMarkShape} aria-hidden />
      <span className={styles.maggieMarkDot} aria-hidden />
    </div>
  );
}

function AgencyOverview() {
  return (
    <div className={styles.agencyOverview}>
      <div className={styles.agencyOverviewLead}>
        <p className={styles.chapterKicker}>Founded by Mohammad Altaf</p>
        <h2>One studio. Many ways to build.</h2>
        <p>
          Maggie’s Agency works across branding, websites, applications, product
          interfaces, and digital experiences, bridging creative direction with
          development from concept to launch.
        </p>
      </div>

      <div className={styles.agencyServiceList}>
        {MAGGIE_SERVICES.map((service, index) => (
          <div key={service}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{service}</strong>
          </div>
        ))}
      </div>

      <div className={styles.agencyMetric}>
        <strong>40+</strong>
        <span>clients</span>
      </div>
    </div>
  );
}

function MaggieProjectVisual({ project }: { project: MaggieProject }) {
  return (
    <div
      className={styles.maggieProjectVisual}
      data-variant={project.variant}
      aria-hidden
    >
      <span className={styles.projectMonogram}>
        {project.variant === "dejure" && "DB"}
        {project.variant === "brutal" && "B"}
        {project.variant === "gaura" && "GT"}
        {project.variant === "void" && "V"}
      </span>
      <span className={styles.projectPlane} data-plane="one" />
      <span className={styles.projectPlane} data-plane="two" />
      <span className={styles.projectPlane} data-plane="three" />
      <span className={styles.projectSignal} />
    </div>
  );
}

function MaggieProjectSlide({
  project,
  position,
  progress,
  mobile,
}: {
  project: MaggieProject;
  position: number;
  progress: MotionValue<number>;
  mobile: boolean;
}) {
  const titleLines =
    project.title === "DejureBook"
      ? ["Dejure", "Book"]
      : project.title.split(" ");
  const start = 0.69 + position * 0.065;
  const visibleAt = start + 0.025;
  const fadeAt = start + 0.052;
  const end = start + 0.078;
  const last = position === MAGGIE_PROJECTS.length - 1;
  const x = useTransform(
    progress,
    last ? [start, visibleAt] : [start, visibleAt, fadeAt, end],
    last ? ["100%", "0%"] : ["100%", "0%", "0%", "-100%"]
  );
  const mobileOpacity = useTransform(progress, (value) => {
    if (value < start) return 0;
    if (last) return 1;
    return value < end ? 1 : 0;
  });

  return (
    <motion.article
      className={styles.maggieProjectSlide}
      data-variant={project.variant}
      style={{ x: mobile ? 0 : x, opacity: mobile ? mobileOpacity : 1 }}
      aria-label={`${project.title}, selected Maggie’s Agency work`}
    >
      <div className={styles.maggieProjectCopy}>
        <p>Selected work · {project.index}</p>
        <h2>
          {titleLines.map((line) => <span key={line}>{line}</span>)}
        </h2>
        <span>Maggie’s Agency · Project archive</span>
      </div>
      <div className={styles.maggieProjectMedia}>
        <MaggieProjectVisual project={project} />
        <p>Replace with approved project imagery</p>
      </div>
    </motion.article>
  );
}

function AgencyLink() {
  return (
    <Link href="/" className={styles.agencyLink}>
      <span>
        Visit Maggie’s<span className={styles.mobileAgencyBreak}><br /></span> Agency
      </span>
      <ArrowUpRight size={24} strokeWidth={1.5} aria-hidden />
    </Link>
  );
}

export function MaggieChapter() {
  const chapterRef = useRef<HTMLElement>(null);
  const reduce = Boolean(useReducedMotion());
  const mobile = usePortfolioMobile();
  const { scrollYProgress } = useScroll({
    target: chapterRef,
    offset: ["start start", "end end"],
  });

  const firstOpacity = useTransform(scrollYProgress, (value) =>
    fadeOut(value, 0.08, 0.14)
  );
  const secondOpacity = useTransform(scrollYProgress, (value) =>
    fadeInOut(value, 0.12, 0.18, 0.22, 0.28)
  );
  const thirdOpacity = useTransform(scrollYProgress, (value) =>
    fadeInOut(value, 0.26, 0.32, 0.37, 0.43)
  );
  const revealOpacity = useTransform(scrollYProgress, (value) =>
    fadeInOut(value, 0.4, 0.47, 0.53, 0.59)
  );
  const revealScale = useTransform(scrollYProgress, [0.4, 0.56], [0.9, 1]);
  const overviewOpacity = useTransform(scrollYProgress, (value) =>
    fadeIn(value, 0.56, 0.62)
  );
  const overviewY = useTransform(scrollYProgress, [0.56, 0.7], [65, 0]);
  const mobileRevealOpacity = useTransform(scrollYProgress, (value) =>
    fadeInOut(value, 0.4, 0.45, 0.55, 0.6)
  );
  const mobileOverviewOpacity = useTransform(scrollYProgress, (value) =>
    fadeIn(value, 0.57, 0.63)
  );
  const ctaY = useTransform(
    scrollYProgress,
    mobile ? [0.82, 0.92] : [0.7, 0.8],
    ["100%", "0%"]
  );

  if (reduce) {
    return (
      <StoryChapter
        ref={chapterRef}
        id="maggie"
        index="07"
        label="Maggie’s Agency"
        className={cn(styles.reducedChapter, styles.maggieChapter)}
      >
        <div className={styles.reducedStory}>
          <StoryReveal>
            <h2 className={styles.reducedTitle}>
              I wasn&apos;t just building projects.
              <em>I was building an agency.</em>
            </h2>
          </StoryReveal>
          <AgencyOverview />
          <div className={styles.reducedMaggieProjects} hidden>
            {MAGGIE_PROJECTS.map((project) => (
              <article key={project.title}>
                <div>
                  <span>{project.index}</span>
                  <h3>{project.title}</h3>
                </div>
                <MaggieProjectVisual project={project} />
              </article>
            ))}
          </div>
          <div id="maggie-visit" className={styles.reducedAgencyCta} data-chapter="maggie">
            <p>The agency became another way to keep building.</p>
            <AgencyLink />
          </div>
        </div>
      </StoryChapter>
    );
  }

  return (
    <StoryChapter
      ref={chapterRef}
      id="maggie"
      index="07"
      label="Maggie’s Agency"
      className={styles.maggieChapter}
    >
      <div className={styles.stickyStage}>
        <motion.p className={styles.maggieSentence} style={{ opacity: firstOpacity }}>
          At some point, <em>I realized…</em>
        </motion.p>

        <motion.p className={styles.maggieSentence} style={{ opacity: secondOpacity }}>
          I wasn&apos;t just <em>building projects.</em>
        </motion.p>

        <motion.p className={styles.maggieSentence} style={{ opacity: thirdOpacity }}>
          I was building <em>an agency.</em>
        </motion.p>

        <motion.div
          className={styles.maggieReveal}
          style={{
            opacity: mobile ? mobileRevealOpacity : revealOpacity,
            scale: mobile ? 1 : revealScale,
          }}
        >
          <MaggieMark />
          <div>
            <p>Creative studio · Founded by Mohammad Altaf</p>
            <h2>MAGGIE’S<br />AGENCY</h2>
          </div>
        </motion.div>

        <motion.div
          className={styles.agencyOverviewScene}
          style={{
            opacity: mobile ? mobileOverviewOpacity : overviewOpacity,
            y: mobile ? 0 : overviewY,
          }}
        >
          <AgencyOverview />
        </motion.div>

        <div className={styles.maggieProjectSlides} hidden>
          {MAGGIE_PROJECTS.map((project, position) => (
            <MaggieProjectSlide
              key={project.title}
              project={project}
              position={position}
              progress={scrollYProgress}
              mobile={mobile}
            />
          ))}
        </div>

        <motion.div
          className={styles.agencyCtaScene}
          style={{ y: ctaY }}
        >
          <p>The agency became another way to keep building.</p>
          <AgencyLink />
        </motion.div>
      </div>
    </StoryChapter>
  );
}
