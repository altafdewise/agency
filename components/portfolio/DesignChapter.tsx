"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { fadeIn, fadeInOut, fadeOut } from "@/lib/portfolio-motion";
import { usePortfolioMobile } from "@/lib/use-portfolio-mobile";
import { MediaFrame } from "./MediaFrame";
import { StoryChapter } from "./StoryChapter";
import { StoryReveal } from "./StoryReveal";
import { ViewportVideo } from "./ViewportVideo";
import styles from "./portfolio.module.css";

const DESIGN_TOOLS = [
  "Figma",
  "Photoshop",
  "Illustrator",
  "After Effects",
  "Premiere Pro",
  "Framer",
] as const;

function DesignStudy({
  src,
  label,
  index,
  className,
  active,
}: {
  src: string;
  label: string;
  index: string;
  className?: string;
  active?: boolean;
}) {
  return (
    <MediaFrame label={label} index={index} className={className}>
      <ViewportVideo src={src} label={label} active={active} />
    </MediaFrame>
  );
}

export function DesignChapter() {
  const chapterRef = useRef<HTMLElement>(null);
  const [galleryActive, setGalleryActive] = useState(false);
  const reduce = Boolean(useReducedMotion());
  const mobile = usePortfolioMobile();
  const { scrollYProgress } = useScroll({
    target: chapterRef,
    offset: ["start start", "end end"],
  });

  const introOpacity = useTransform(scrollYProgress, (value) =>
    fadeOut(value, 0.12, 0.2)
  );
  const introY = useTransform(scrollYProgress, [0.12, 0.2], [0, -54]);
  const galleryOpacity = useTransform(scrollYProgress, (value) =>
    fadeInOut(value, 0.22, 0.29, 0.58, 0.64)
  );
  const galleryX = useTransform(scrollYProgress, [0.18, 0.64], [70, -35]);
  const metricsOpacity = useTransform(scrollYProgress, (value) =>
    fadeIn(value, 0.65, 0.73)
  );
  const metricsY = useTransform(scrollYProgress, [0.65, 0.8], [68, 0]);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const nextGalleryActive = value > 0.22 && value < 0.64;
    setGalleryActive((current) =>
      current === nextGalleryActive ? current : nextGalleryActive
    );
  });

  if (reduce || mobile) {
    return (
      <StoryChapter
        ref={chapterRef}
        id="design"
        index="02"
        label="Design"
        className={styles.reducedChapter}
      >
        <div className={styles.reducedStory}>
          <StoryReveal>
            <h2 className={styles.reducedTitle}>
              It started with making things <em>look good.</em>
            </h2>
          </StoryReveal>
          <div className={styles.reducedDevelopmentCopy}>
            <p>Branding, UI/UX, websites and product design. Shaped as one visual system, not a collection of disconnected screens.</p>
            <div className={styles.toolLine} aria-label="Design tools">
              {DESIGN_TOOLS.map((tool) => <span key={tool}>{tool}</span>)}
            </div>
          </div>
          <div className={styles.reducedMediaGrid}>
            <DesignStudy src="/designs/1.mp4" label="DejureBook" index="01" />
            <DesignStudy
              src="/designs/2.mp4"
              label="Figma UI/UX design process"
              index="02"
            />
            <DesignStudy
              src="/designs/3.mp4"
              label="Consultancy website"
              index="03"
            />
          </div>
          <div className={styles.reducedMetrics}>
            <div><strong>5+</strong><span>years creating</span></div>
            <div><strong>40+</strong><span>clients</span></div>
          </div>
        </div>
      </StoryChapter>
    );
  }

  return (
    <StoryChapter
      ref={chapterRef}
      id="design"
      index="02"
      label="Design"
      className={styles.designChapter}
    >
      <div className={styles.stickyStage}>
        <motion.div
          className={styles.designIntro}
          style={{ opacity: introOpacity, y: introY }}
        >
          <p className={styles.chapterKicker}>The first language</p>
          <h2 className={styles.chapterStatement}>
            It started with making things <em>look good.</em>
          </h2>
        </motion.div>

        <motion.div
          className={styles.designGallery}
          style={{ opacity: galleryOpacity, x: galleryX }}
        >
          <div className={styles.designGalleryCopy}>
            <p className={styles.chapterKicker}>From identity to interface</p>
            <h2 className={styles.galleryTitle}>Making ideas visible.</h2>
            <p className={styles.galleryBody}>
              Branding, UI/UX, websites and product design. Shaped as one visual
              system, not a collection of disconnected screens.
            </p>
            <div className={styles.toolLine} aria-label="Design tools">
              {DESIGN_TOOLS.map((tool) => <span key={tool}>{tool}</span>)}
            </div>
          </div>
          <div className={styles.designFrameGrid}>
            <DesignStudy
              src="/designs/1.mp4"
              label="DejureBook"
              index="01"
              className={styles.designFrameWide}
              active={galleryActive}
            />
            <DesignStudy
              src="/designs/2.mp4"
              label="Figma UI/UX design process"
              index="02"
              active={galleryActive}
            />
            <DesignStudy
              src="/designs/3.mp4"
              label="Consultancy website"
              index="03"
              active={galleryActive}
            />
          </div>
        </motion.div>

        <motion.div
          className={styles.designMetricsScene}
          style={{ opacity: metricsOpacity, y: metricsY }}
        >
          <div className={styles.metricsIntro}>
            <p className={styles.chapterKicker}>Practice, not decoration</p>
            <p>
              Years spent learning how brands speak, products behave, and small
              details change the way something feels.
            </p>
          </div>
          <div className={styles.metricBlock}>
            <strong>5+</strong>
            <span>years creating</span>
          </div>
          <div className={styles.metricBlock}>
            <strong>40+</strong>
            <span>clients</span>
          </div>
          <p className={styles.metricsFootnote}>
            Creative direction · Branding · UI/UX · Web design · Product design
          </p>
        </motion.div>
      </div>
    </StoryChapter>
  );
}
