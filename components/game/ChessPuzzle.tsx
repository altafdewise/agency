"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import type { PieceDropHandlerArgs } from "react-chessboard";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { usePath } from "@/components/PathProvider";

/**
 * A real-feeling, 16-piece middlegame with a single clean tactical shot: the
 * smothered-style knight sac **Nxf7#**. The black king is boxed on h8 by its
 * own rook (g8) and pawns (g7/h7), so the knight landing on f7 is mate with no
 * recapture. Nxf7# is the ONLY mate among 23 legal moves — findable with a bit
 * of scanning, but not a one-tap accident. Verified with chess.js.
 */
const PUZZLE_FEN = "r5rk/pp3ppp/8/6N1/8/8/PP3PPP/R5K1 w - - 0 1";
const SIDE_TO_MOVE = "white" as const; // drives the subline + board orientation
const WIN_REDIRECT_MS = 2800; // pause on the win moment, then head home
const WRONG_RESET_MS = 650; // let the wrong move land, then snap back

type Status = "idle" | "wrong" | "won";

// On-brand two-tone board: warm bone light squares, warm charcoal dark squares
// (not the default brown/green). Standard pieces stay clearly legible on both.
const LIGHT_SQUARE = "#E8E2D5";
const DARK_SQUARE = "#3D3833";

/** A few bone motes drifting up — a restrained echo of the hero orb. */
const PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  x: 8 + (i * 84) / 10 + ((i * 37) % 11),
  delay: (i % 5) * 0.12,
  size: 3 + (i % 3),
}));

export function ChessPuzzle() {
  const router = useRouter();
  const { goTo } = usePath();
  const reduce = useReducedMotion();

  const [fen, setFen] = useState(PUZZLE_FEN);
  const [status, setStatus] = useState<Status>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  // Leave to the home page. `fresh` resets the flow to its first step so the
  // win lands back on the hero rather than the close screen they came from.
  const leave = (fresh: boolean) => {
    if (fresh) goTo(0);
    router.push("/");
  };

  // After a win, auto-advance home (or instantly under reduced motion).
  useEffect(() => {
    if (status !== "won") return;
    const t = setTimeout(() => leave(true), reduce ? 400 : WIN_REDIRECT_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, reduce]);

  function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs) {
    if (!targetSquare || status === "won") return false;

    // Validate against the live position. chess.js throws on an illegal move,
    // which we treat as "snap the piece back" (no penalty).
    const probe = new Chess(fen);
    try {
      probe.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
    } catch {
      return false;
    }

    if (resetTimer.current) clearTimeout(resetTimer.current);
    setFen(probe.fen());

    if (probe.isCheckmate()) {
      setStatus("won");
      return true;
    }

    // Legal but not the mate: gentle nudge, then reset so they can retry.
    setStatus("wrong");
    resetTimer.current = setTimeout(() => setFen(PUZZLE_FEN), WRONG_RESET_MS);
    return true;
  }

  const won = status === "won";

  return (
    <div className="relative flex w-full flex-col items-center">
      {/* Celebration sits BEHIND the content (z-0) so it never overlaps text. */}
      {won && <Celebration reduce={!!reduce} />}

      {/* Heading + subline */}
      <Reveal blur y={20} duration={0.6} className="relative z-10">
        <h1 className="headline-md text-center text-balance">one move to win.</h1>
      </Reveal>
      <Reveal className="relative z-10 mt-4" delay={0.15}>
        <p className="body-muted text-center">
          find the checkmate. {SIDE_TO_MOVE} to move.
        </p>
      </Reveal>

      {/* Board */}
      <Reveal
        className="relative z-10 mt-10 w-full max-w-[min(92vw,460px)]"
        delay={0.3}
        y={24}
      >
        <div
          className="relative"
          style={{
            borderRadius: 14,
            padding: 10,
            background:
              "linear-gradient(180deg, rgba(242,238,227,0.05), rgba(242,238,227,0.015))",
            boxShadow: won
              ? "0 0 0 1px rgba(255,68,56,0.5), 0 40px 100px -40px rgba(255,68,56,0.35)"
              : "0 0 0 1px rgba(242,238,227,0.08), 0 40px 100px -50px rgba(0,0,0,0.9)",
            transition: "box-shadow 0.5s ease",
          }}
        >
          <Chessboard
            options={{
              id: "mate-in-one",
              position: fen,
              boardOrientation: SIDE_TO_MOVE,
              onPieceDrop,
              allowDragging: !won,
              allowDrawingArrows: false,
              showAnimations: !reduce,
              animationDurationInMs: reduce ? 0 : 250,
              boardStyle: { borderRadius: "8px", overflow: "hidden" },
              lightSquareStyle: { backgroundColor: LIGHT_SQUARE },
              darkSquareStyle: { backgroundColor: DARK_SQUARE },
              dropSquareStyle: {
                boxShadow: "inset 0 0 0 3px rgba(255,68,56,0.7)",
              },
              darkSquareNotationStyle: { color: "rgba(242,238,227,0.55)" },
              lightSquareNotationStyle: { color: "rgba(10,10,10,0.5)" },
            }}
          />
        </div>
      </Reveal>

      {/* Nudge region for legal-but-wrong moves — announced to assistive tech. */}
      <div
        className="relative z-10 mt-6 min-h-[1.5rem] text-center"
        role="status"
        aria-live="polite"
      >
        {status === "wrong" && (
          <p className="body-muted text-sm">not quite — try again.</p>
        )}
      </div>

      {/* Skip / back — never trap them in the game. */}
      {!won && (
        <Reveal className="relative z-10" delay={0.5}>
          <Button variant="link" onClick={() => leave(false)}>
            skip — back to home
          </Button>
        </Reveal>
      )}

      {/* WIN MESSAGE — its own spaced, dark-backed block BELOW the board, so the
          text always has full contrast and never overlaps the board. */}
      {won && <WinPanel reduce={!!reduce} />}
    </div>
  );
}

/** Brand-red glow pulse + drifting bone motes — purely decorative, behind the
 *  content (z-0, no pointer events). Skipped entirely under reduced motion. */
function Celebration({ reduce }: { reduce: boolean }) {
  if (reduce) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <motion.div
        className="absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,68,56,0.26), transparent 65%)",
        }}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: [0, 0.85, 0.4], scale: [0.7, 1.15, 1] }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
      />
      {PARTICLES.map((p) => (
        <motion.span
          key={p.id}
          className="absolute bottom-0 rounded-full bg-foreground"
          style={{ left: `${p.x}%`, width: p.size, height: p.size }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: "-70vh", opacity: [0, 0.7, 0] }}
          transition={{ duration: 2.6, delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

/** The win message: a single bone-white line below the board, clearly spaced
 *  and high-contrast against the dark page. The board auto-redirects home, so
 *  there's no manual control here. */
function WinPanel({ reduce }: { reduce: boolean }) {
  return (
    <motion.p
      className="relative z-10 mx-auto mt-10 max-w-md px-6 text-center font-sans text-base font-light leading-relaxed text-foreground sm:mt-12 sm:text-lg"
      role="status"
      aria-live="assertive"
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      that&apos;s the kind of decisive we like. let&apos;s build something.
    </motion.p>
  );
}

export default ChessPuzzle;
