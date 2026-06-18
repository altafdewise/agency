import type { Metadata } from "next";
import { GameClient } from "@/components/game/GameClient";

export const metadata: Metadata = {
  title: "Quick game",
  description: "One move to win — a quick mate-in-one to end on.",
  robots: { index: false, follow: false },
};

export default function GamePage() {
  return (
    <main className="relative flex min-h-[100dvh] w-full flex-col justify-center px-6 py-28 sm:px-10 sm:py-24">
      <div className="mx-auto w-full max-w-path">
        <GameClient />
      </div>
    </main>
  );
}
