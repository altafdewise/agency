"use client";

import dynamic from "next/dynamic";

/**
 * Lazy-loads the chess libraries (chess.js + react-chessboard) so they only
 * ship when someone actually opens /game — the homepage never carries the
 * board bundle. `ssr: false` also avoids hydrating the drag-and-drop board.
 */
const ChessPuzzle = dynamic(
  () => import("@/components/game/ChessPuzzle").then((m) => m.ChessPuzzle),
  {
    ssr: false,
    loading: () => (
      <div className="flex w-full flex-col items-center">
        <div className="headline-md text-center text-balance opacity-60">
          one move to win.
        </div>
        <div
          className="mt-10 aspect-square w-full max-w-[min(92vw,460px)] animate-pulse rounded-2xl border border-border bg-foreground/[0.03]"
          aria-hidden
        />
        <p className="sr-only">Loading the puzzle…</p>
      </div>
    ),
  }
);

export function GameClient() {
  return <ChessPuzzle />;
}
