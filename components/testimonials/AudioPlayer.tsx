"use client";

import { useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/cn";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Inline testimonial audio player: accent-red play/pause, a thin bone scrubber on
 * a dark track, and current / total time labels.
 *
 * Graceful by design — until the .mp3 actually exists the metadata never loads
 * (or `error` fires), so the player sits in a disabled "audio coming soon" state
 * rather than throwing. Single-playback is coordinated by the parent: when this
 * player starts it calls `onPlay(id)`; whenever `activeId` is some other id we
 * pause ourselves.
 */
export function AudioPlayer({
  id,
  src,
  activeId,
  onPlay,
}: {
  id: string;
  src: string;
  activeId: string | null;
  onPlay: (id: string) => void;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const [ready, setReady] = useState(false);
  const [errored, setErrored] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // If another card's audio takes over, stop ourselves.
  if (activeId !== id && playing) {
    audioRef.current?.pause();
  }

  const disabled = errored || !ready;
  const pct = duration > 0 ? Math.min(100, (time / duration) * 100) : 0;

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio || disabled) return;
    if (playing) {
      audio.pause();
    } else {
      onPlay(id);
      void audio.play().catch(() => setErrored(true));
    }
  };

  const seekToClientX = (clientX: number) => {
    const audio = audioRef.current;
    const el = trackRef.current;
    if (!audio || !el || disabled || duration <= 0) return;
    const rect = el.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    audio.currentTime = frac * duration;
    setTime(audio.currentTime);
  };

  return (
    <div
      className="mt-6 flex items-center gap-3"
      // Keep scrubbing / tapping inside the player from triggering the
      // carousel's swipe-to-navigate handler.
      onPointerDownCapture={(e) => e.stopPropagation()}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration);
          setReady(true);
        }}
        onTimeUpdate={(e) => {
          if (!draggingRef.current) setTime(e.currentTarget.currentTime);
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setTime(0);
        }}
        onError={() => setErrored(true)}
      />

      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-label={playing ? "Pause" : "Play"}
        className={cn(
          "grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-background transition-transform duration-200",
          disabled
            ? "cursor-not-allowed opacity-30"
            : "hover:scale-105 focus-visible:scale-105 active:scale-95"
        )}
      >
        {playing ? (
          <Pause className="h-4 w-4" strokeWidth={2} fill="currentColor" />
        ) : (
          <Play className="ml-0.5 h-4 w-4" strokeWidth={2} fill="currentColor" />
        )}
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div
          ref={trackRef}
          role="slider"
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(time)}
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          onPointerDown={(e) => {
            if (disabled) return;
            draggingRef.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            seekToClientX(e.clientX);
          }}
          onPointerMove={(e) => {
            if (draggingRef.current) seekToClientX(e.clientX);
          }}
          onPointerUp={(e) => {
            draggingRef.current = false;
            e.currentTarget.releasePointerCapture(e.pointerId);
          }}
          onKeyDown={(e) => {
            const audio = audioRef.current;
            if (!audio || disabled || duration <= 0) return;
            if (e.key === "ArrowRight") {
              audio.currentTime = Math.min(duration, audio.currentTime + 5);
              setTime(audio.currentTime);
            } else if (e.key === "ArrowLeft") {
              audio.currentTime = Math.max(0, audio.currentTime - 5);
              setTime(audio.currentTime);
            }
          }}
          className={cn(
            "group relative h-1 w-full rounded-full bg-foreground/15",
            disabled ? "cursor-not-allowed" : "cursor-pointer"
          )}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-foreground/80"
            style={{ width: `${pct}%` }}
          />
          {!disabled && (
            <div
              className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground opacity-0 shadow transition-opacity group-hover:opacity-100"
              style={{ left: `${pct}%` }}
              aria-hidden
            />
          )}
        </div>

        <div className="flex items-center justify-between text-[0.68rem] font-light tabular-nums text-muted/70">
          {disabled ? (
            <span className="uppercase tracking-[0.18em]">audio coming soon</span>
          ) : (
            <span>{formatTime(time)}</span>
          )}
          <span>{disabled ? "--:--" : formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
