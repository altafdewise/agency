"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import type { PieceDropHandlerArgs } from "react-chessboard";
import { Clock3, Play } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { usePath } from "@/components/PathProvider";

type Side = "white" | "black";
type Phase = "intro" | "playing" | "wrong" | "won";

type MatePuzzle = {
  id: string;
  fen: string;
  side: Side;
};

const QUEEN_IMAGE_SRC = "/queen-placeholder.png";
const WIN_QUOTE = "that's the kind of decisive we like.";
const WIN_REDIRECT_MS = 2800;
const REDUCED_WIN_REDIRECT_MS = 400;
const WRONG_RESET_MS = 700;
const LIGHT_SQUARE = "#E8E2D5";
const DARK_SQUARE = "#3D3833";

const PUZZLES: MatePuzzle[] = [
  {
    id: "01",
    fen: "r5rk/pp3ppp/8/6N1/8/8/PP3PPP/R5K1 w - - 0 1",
    side: "white",
  },
  {
    id: "02",
    fen: "6kr/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1",
    side: "white",
  },
  {
    id: "03",
    fen: "5rk1/5ppp/8/7Q/8/8/2B2PPP/6K1 w - - 0 1",
    side: "white",
  },
  {
    id: "04",
    fen: "6k1/5ppp/3b4/8/7q/8/5PPP/5RK1 b - - 0 1",
    side: "black",
  },
  {
    id: "05",
    fen: "6k1/5ppp/8/8/2b5/8/5PPP/4rRK1 b - - 0 1",
    side: "black",
  },
];

function formatTime(ms: number) {
  const totalTenths = Math.max(0, Math.floor(ms / 100));
  const minutes = Math.floor(totalTenths / 600);
  const seconds = Math.floor((totalTenths % 600) / 10);
  const tenths = totalTenths % 10;

  if (minutes > 0) return `${minutes}:${String(seconds).padStart(2, "0")}.${tenths}`;
  return `${seconds}.${tenths}s`;
}

function pickPuzzle() {
  return PUZZLES[Math.floor(Math.random() * PUZZLES.length)] ?? PUZZLES[0];
}

export function ChessPuzzle() {
  const { goTo } = usePath();
  const reduce = useReducedMotion();
  const [puzzle, setPuzzle] = useState<MatePuzzle | null>(null);
  const [fen, setFen] = useState(PUZZLES[0].fen);
  const [phase, setPhase] = useState<Phase>("intro");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [solvedMs, setSolvedMs] = useState<number | null>(null);
  const startAt = useRef<number | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activePuzzle = puzzle ?? PUZZLES[0];
  const isTiming = phase === "playing" || phase === "wrong";
  const shownTime = solvedMs ?? elapsedMs;

  useEffect(() => {
    if (!isTiming || startAt.current === null) return;

    const tick = () => setElapsedMs(Date.now() - (startAt.current ?? Date.now()));
    tick();
    const interval = window.setInterval(tick, 100);
    return () => window.clearInterval(interval);
  }, [isTiming]);

  useEffect(() => {
    if (phase !== "won") return;

    const t = window.setTimeout(() => {
      try {
        goTo(0);
      } finally {
        window.location.assign("/");
      }
    }, reduce ? REDUCED_WIN_REDIRECT_MS : WIN_REDIRECT_MS);

    return () => window.clearTimeout(t);
  }, [goTo, phase, reduce]);

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  function startGame() {
    const next = pickPuzzle();
    if (resetTimer.current) clearTimeout(resetTimer.current);
    setPuzzle(next);
    setFen(next.fen);
    setPhase("playing");
    setElapsedMs(0);
    setSolvedMs(null);
    startAt.current = Date.now();
  }

  function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs) {
    if (!targetSquare || !puzzle || phase !== "playing") return false;

    const probe = new Chess(fen);
    try {
      probe.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
    } catch {
      return false;
    }

    if (resetTimer.current) clearTimeout(resetTimer.current);
    setFen(probe.fen());

    if (probe.isCheckmate()) {
      const finalMs = Date.now() - (startAt.current ?? Date.now());
      setSolvedMs(finalMs);
      setElapsedMs(finalMs);
      setPhase("won");
      return true;
    }

    setPhase("wrong");
    resetTimer.current = setTimeout(() => {
      setFen(puzzle.fen);
      setPhase("playing");
    }, reduce ? 180 : WRONG_RESET_MS);
    return true;
  }

  return (
    <AnimatePresence mode="wait">
      {phase === "won" ? (
        <WinPoster
          key="queen-win"
          timeLabel={formatTime(shownTime)}
          reduce={!!reduce}
        />
      ) : (
        <motion.section
          key="game-board"
          className="relative mx-auto flex w-full max-w-[620px] flex-col items-center text-center"
          exit={reduce ? undefined : { opacity: 0, scale: 0.96, filter: "blur(8px)" }}
          transition={{ duration: reduce ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          <Reveal blur y={18} duration={0.55}>
            <h1 className="headline-md text-balance">one move to win.</h1>
          </Reveal>

          <Reveal className="mt-8 w-full" delay={0.15} y={22}>
            <div className="relative mx-auto w-full max-w-[min(90vw,520px)] rounded-lg border border-foreground/[0.1] bg-background/35 p-3 shadow-[0_34px_100px_-62px_rgba(0,0,0,0.95)] sm:p-4">
              {phase === "intro" ? (
                <IntroPanel onPlay={startGame} reduce={!!reduce} />
              ) : (
                <Chessboard
                  options={{
                    id: "mate-in-one",
                    position: fen,
                    boardOrientation: activePuzzle.side,
                    onPieceDrop,
                    allowDragging: phase === "playing",
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
              )}
            </div>
          </Reveal>

          <div
            className="mt-5 min-h-[3.5rem] text-center"
            role="status"
            aria-live="polite"
          >
            <TimerReadout value={shownTime} active={isTiming} />

            {phase === "wrong" && (
              <p className="mt-3 text-sm font-light text-muted">
                not that one. the mate is cleaner.
              </p>
            )}
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}

function TimerReadout({
  value,
  active,
}: {
  value: number;
  active: boolean;
}) {
  return (
    <div
      className={[
        "inline-flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-medium uppercase tracking-[0.16em] transition-colors duration-200",
        active
            ? "border-foreground/20 bg-foreground/[0.06] text-foreground"
            : "border-foreground/12 bg-foreground/[0.035] text-muted",
      ].join(" ")}
    >
      <Clock3 className="h-3.5 w-3.5" strokeWidth={1.7} />
      <span>{active ? formatTime(value) : "ready"}</span>
    </div>
  );
}

function IntroPanel({
  onPlay,
  reduce,
}: {
  onPlay: () => void;
  reduce: boolean;
}) {
  return (
    <div className="grid aspect-square place-items-center rounded-lg border border-foreground/[0.08] bg-background/55 px-6 text-center">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="eyebrow">mate in one</p>
        <Button className="mt-7" size="lg" onClick={onPlay}>
          <Play className="h-5 w-5" strokeWidth={1.7} />
          Play the game
        </Button>
      </motion.div>
    </div>
  );
}

function WinPoster({
  timeLabel,
  reduce,
}: {
  timeLabel: string;
  reduce: boolean;
}) {
  return (
    <motion.section
      key="queen-win"
      className="relative isolate mx-auto flex min-h-[min(78vh,760px)] w-full max-w-[620px] flex-col items-center justify-center gap-8 overflow-visible px-6 py-10 text-center sm:gap-10 sm:py-12"
      initial={reduce ? false : { opacity: 0, y: 18, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={reduce ? undefined : { opacity: 0, scale: 0.98 }}
      transition={{ duration: reduce ? 0 : 0.62, ease: [0.22, 1, 0.36, 1] }}
      role="status"
      aria-live="assertive"
    >
      <div
        aria-hidden
        className="pointer-events-none relative z-10 aspect-[2/3] w-[clamp(14.5rem,66vw,20rem)] sm:w-[clamp(18rem,26vw,21.5rem)]"
      >
        <div
          className="absolute left-1/2 top-[52%] z-0 h-[74%] w-[132%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-90 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(242,238,227,0.24) 0%, rgba(255,68,56,0.12) 42%, rgba(255,68,56,0) 72%)",
          }}
        />
        <div
          className="relative z-10 h-full w-full bg-contain bg-center bg-no-repeat opacity-95 mix-blend-screen"
          style={{ backgroundImage: `url(${QUEEN_IMAGE_SRC})` }}
        />
      </div>
      <div className="relative z-20 mx-auto max-w-[24rem] px-2">
        <p className="font-display text-[clamp(1.45rem,5.8vw,2.45rem)] font-semibold leading-[1.05] tracking-normal text-foreground drop-shadow-[0_10px_30px_rgba(0,0,0,0.82)]">
          {WIN_QUOTE}
        </p>
        <p className="mt-3 font-sans text-sm font-light tracking-normal text-foreground/55">
          solved in <span className="text-accent/85">{timeLabel}</span>
        </p>
      </div>
    </motion.section>
  );
}

export default ChessPuzzle;
