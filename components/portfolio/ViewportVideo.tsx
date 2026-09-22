"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./portfolio.module.css";

type ViewportVideoProps = {
  src: string;
  label: string;
  active?: boolean;
};

export function ViewportVideo({ src, label, active = true }: ViewportVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const intersectsViewportRef = useRef(false);
  const [failed, setFailed] = useState(false);

  const isVisuallyVisible = useCallback((video: HTMLVideoElement) => {
    let element: HTMLElement | null = video;

    while (element) {
      const style = window.getComputedStyle(element);
      const opacity = Number.parseFloat(style.opacity);

      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        (!Number.isNaN(opacity) && opacity <= 0.01)
      ) {
        return false;
      }

      element = element.parentElement;
    }

    return true;
  }, []);

  const syncPlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video || failed) return;

    if (
      active &&
      intersectsViewportRef.current &&
      isVisuallyVisible(video) &&
      !document.hidden
    ) {
      void video.play().catch(() => {
        // Muted inline playback is retried when visibility or readiness changes.
      });
    } else {
      video.pause();
    }
  }, [active, failed, isVisuallyVisible]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || failed) return;

    video.pause();

    if (!("IntersectionObserver" in window)) {
      intersectsViewportRef.current = true;
      syncPlayback();
      return;
    }

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        intersectsViewportRef.current = entry.isIntersecting && entry.intersectionRatio >= 0.15;
        syncPlayback();
      },
      { threshold: [0, 0.15, 0.5] }
    );

    const visibilityObserver = new MutationObserver(syncPlayback);
    let ancestor = video.parentElement;

    while (ancestor) {
      visibilityObserver.observe(ancestor, {
        attributes: true,
        attributeFilter: ["style", "class", "hidden"],
      });
      ancestor = ancestor.parentElement;
    }

    const handleVisibility = () => syncPlayback();
    intersectionObserver.observe(video);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      intersectionObserver.disconnect();
      visibilityObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      video.pause();
    };
  }, [failed, syncPlayback]);

  if (failed) {
    return (
      <div className={styles.videoFallback} role="img" aria-label={`${label} video unavailable`}>
        <span>Video unavailable</span>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      className={styles.projectVideo}
      src={src}
      aria-label={label}
      autoPlay={active}
      muted
      loop
      playsInline
      preload="metadata"
      onCanPlay={syncPlayback}
      onPlay={syncPlayback}
      onError={() => setFailed(true)}
    />
  );
}
