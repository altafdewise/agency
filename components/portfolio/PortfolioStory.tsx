"use client";

import { useEffect, useRef, useState } from "react";
import { attachChapterScroll } from "@/lib/chapter-scroll";
import { usePortfolioMobile } from "@/lib/use-portfolio-mobile";
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
  const storyRef = useRef<HTMLElement>(null);
  const [activeChapter, setActiveChapter] = useState("curiosity");
  const mobile = usePortfolioMobile();

  useEffect(() => {
    if (storyRef.current) return attachChapterScroll(storyRef.current);
  }, []);

  useEffect(() => {
    // A direct hash can initially land on the much taller server-rendered
    // desktop track. Restore its mobile position after hydration and browser
    // scroll restoration, unless the visitor has already started navigating.
    if (!mobile || !window.location.hash) return;
    const initialHash = window.location.hash;
    let interacted = false;
    const release = () => { interacted = true; };
    const align = () => {
      if (interacted || window.location.hash !== initialHash) return;
      document.getElementById(initialHash.slice(1))?.scrollIntoView({ block: "start", behavior: "instant" });
    };
    const first = window.setTimeout(align, 0);
    const restored = window.setTimeout(align, 300);
    window.addEventListener("pageshow", align);
    window.addEventListener("load", align);
    window.addEventListener("wheel", release, { passive: true });
    window.addEventListener("touchstart", release, { passive: true });
    window.addEventListener("keydown", release);
    return () => {
      window.clearTimeout(first);
      window.clearTimeout(restored);
      window.removeEventListener("pageshow", align);
      window.removeEventListener("load", align);
      window.removeEventListener("wheel", release);
      window.removeEventListener("touchstart", release);
      window.removeEventListener("keydown", release);
    };
  }, [mobile]);

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
      <main ref={storyRef} id="portfolio-content" className={styles.story} tabIndex={-1}>
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
