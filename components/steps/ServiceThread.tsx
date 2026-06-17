"use client";

import { useEffect, useRef, useState } from "react";

type Pt = { x: number; y: number };

interface Props {
  containerRef: React.RefObject<HTMLDivElement | null>;
  cardRefs: React.RefObject<HTMLDivElement | null>[];
  hoveredIndex: number | null;
  reduced: boolean;
}

/**
 * Renders a thin SVG spine connecting each service card's number-badge corner
 * in sequence (01–08), with a small node at each badge position that lights up
 * to accent red on card hover. Scoped strictly to the service-card grid.
 */
export function ServiceThread({
  containerRef,
  cardRefs,
  hoveredIndex,
  reduced,
}: Props) {
  const [pts, setPts] = useState<Pt[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [visible, setVisible] = useState(false);
  // Keep refs stable across renders for the ResizeObserver cleanup.
  const cardRefsRef = useRef(cardRefs);
  cardRefsRef.current = cardRefs;

  useEffect(() => {
    const measure = () => {
      const ct = containerRef.current;
      if (!ct) return;
      const cr = ct.getBoundingClientRect();
      // sm breakpoint (640px) shifts badge from right-5/top-5 (20px) to right-6/top-6 (24px).
      const pad = window.innerWidth >= 640 ? 24 : 20;
      setPts(
        cardRefsRef.current.map((ref) => {
          const el = ref.current;
          if (!el) return { x: 0, y: 0 };
          const r = el.getBoundingClientRect();
          return { x: r.right - cr.left - pad, y: r.top - cr.top + pad };
        })
      );
      setSize({ w: cr.width, h: cr.height });
    };

    // Delay until reveal animations settle (stagger starts 0.45s, last card done ~1.5s).
    // Wrapper divs are unaffected by framer-motion transforms so positions are
    // always correct; the delay is purely so dots aren't visible during the fly-in.
    const init = setTimeout(() => {
      measure();
      setVisible(true);
    }, 1700);

    const ro = new ResizeObserver(measure);
    const ct = containerRef.current;
    if (ct) ro.observe(ct);
    cardRefsRef.current.forEach((r) => {
      if (r.current) ro.observe(r.current);
    });

    return () => {
      clearTimeout(init);
      ro.disconnect();
    };
  }, [containerRef]);

  if (pts.length < 2 || size.w === 0) return null;

  const polyPts = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  return (
    <svg
      aria-hidden
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: size.w,
        height: size.h,
        zIndex: -1,
        pointerEvents: "none",
        overflow: "visible",
        opacity: visible ? 1 : 0,
        transition: reduced ? "none" : "opacity 0.8s ease",
      }}
    >
      {/* Spine line — 1 px, very low opacity bone */}
      <polyline
        points={polyPts}
        stroke="rgba(242,238,227,0.10)"
        strokeWidth="1"
        fill="none"
        strokeLinejoin="round"
      />

      {/* Node at each badge position */}
      {pts.map((p, i) => {
        const on = hoveredIndex === i;
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={2}
            fill={on ? "#FF4438" : "rgba(242,238,227,0.22)"}
            style={{
              filter: on
                ? "drop-shadow(0 0 4px rgba(255,68,56,0.6))"
                : "none",
              transition: reduced
                ? "none"
                : "fill 0.2s ease, filter 0.2s ease",
            }}
          />
        );
      })}
    </svg>
  );
}
