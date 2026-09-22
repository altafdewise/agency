"use client";

import { useEffect, useState } from "react";
import { CuriosityChapter } from "./CuriosityChapter";
import { DesignChapter } from "./DesignChapter";
import { DevelopmentChapter } from "./DevelopmentChapter";
import { CybersecurityChapter } from "./CybersecurityChapter";
import { VoidChapter } from "./VoidChapter";
import { GamesChapter } from "./GamesChapter";
import { MaggieChapter } from "./MaggieChapter";
import { HumanChapter } from "./HumanChapter";
import { NextChapter } from "./NextChapter";
import { PortfolioNav } from "./PortfolioNav";
import styles from "./portfolio.module.css";

export function PortfolioStory() {
  const [activeChapter, setActiveChapter] = useState("curiosity");

  useEffect(() => {
    document.body.classList.add("portfolio-theme");
    return () => document.body.classList.remove("portfolio-theme");
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const marker = window.innerHeight * 0.48;
      let next = "curiosity";
      document.querySelectorAll<HTMLElement>("[data-chapter]").forEach((section) => {
        if (section.getBoundingClientRect().top <= marker) {
          next = section.dataset.chapter ?? next;
        }
      });
      setActiveChapter((current) => (current === next ? current : next));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className={styles.page}>
      <PortfolioNav activeChapter={activeChapter} />
      <main id="portfolio-content" className={styles.story} tabIndex={-1}>
        <CuriosityChapter />
        <DesignChapter />
        <DevelopmentChapter />
        <CybersecurityChapter />
        <VoidChapter />
        <GamesChapter />
        <MaggieChapter />
        <HumanChapter />
        <NextChapter />
      </main>
      <div className={styles.paperGrain} aria-hidden />
    </div>
  );
}
