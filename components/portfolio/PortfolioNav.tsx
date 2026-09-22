"use client";

import Link from "next/link";
import { motion, useScroll, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { mailtoHref } from "@/lib/contact";
import { PORTFOLIO_CHAPTERS } from "@/lib/portfolio";
import styles from "./portfolio.module.css";

export function PortfolioNav({ activeChapter }: { activeChapter: string }) {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 30,
    mass: 0.2,
  });
  const active =
    PORTFOLIO_CHAPTERS.find((chapter) => chapter.id === activeChapter) ??
    PORTFOLIO_CHAPTERS[0];
  const darkChapter = activeChapter === "cybersecurity" || activeChapter === "void";
  const navTheme = activeChapter === "next" ? "adaptive" : darkChapter ? "dark" : "light";

  return (
    <>
      <a className={styles.skipLink} href="#portfolio-content">
        Skip to story
      </a>

      <header className={styles.portfolioNav} data-theme={navTheme}>
        <a className={styles.wordmark} href="#curiosity" aria-label="Altaf portfolio, top">
          Altaf<span>.</span>
        </a>

        <div className={styles.currentChapter} aria-label="Current chapter">
          <span>{active.index}</span>
          <span>{active.label}</span>
        </div>

        <nav className={styles.utilityNav} aria-label="Portfolio links">
          <Link href="/" className={styles.utilityLink}>
            Maggie
            <ArrowUpRight aria-hidden size={13} strokeWidth={1.7} />
          </Link>
          <a href={mailtoHref("Let's work together")} className={styles.utilityLink}>
            Contact
          </a>
        </nav>
      </header>

      <motion.div
        className={styles.pageProgress}
        style={{ scaleX: progress }}
        aria-hidden
      />

      <nav
        className={styles.chapterRail}
        data-theme={navTheme}
        aria-label="Story chapters"
      >
        <ol>
          {PORTFOLIO_CHAPTERS.map((chapter) => {
            const isActive = chapter.id === activeChapter;
            const isAvailable = chapter.phase <= 5;
            return (
              <li key={chapter.id}>
                {isAvailable ? (
                  <a
                    href={`#${chapter.id}`}
                    className={styles.chapterRailItem}
                    data-active={isActive}
                    data-available="true"
                    aria-current={isActive ? "location" : undefined}
                  >
                    <span className={styles.railLabel}>{chapter.label}</span>
                    <span className={styles.railIndex}>{chapter.index}</span>
                  </a>
                ) : (
                  <span
                    className={styles.chapterRailItem}
                    data-active="false"
                    data-available="false"
                    aria-label={`${chapter.index}, ${chapter.label}, later chapter`}
                  >
                    <span className={styles.railLabel}>{chapter.label}</span>
                    <span className={styles.railIndex}>{chapter.index}</span>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
