"use client";

import { User } from "lucide-react";
import type { Testimonial } from "@/lib/testimonials";
import { AudioPlayer } from "./AudioPlayer";

/**
 * One testimonial card: quote, optional inline audio player, the person
 * (placeholder avatar + name + role), and optional metric chips.
 *
 * Presentational only — carousel positioning/animation lives in the parent.
 * `isActive` gates interactivity so the cards peeking behind don't grab focus.
 */
export function TestimonialCard({
  testimonial,
  isActive,
  activeAudioId,
  onPlayAudio,
}: {
  testimonial: Testimonial;
  isActive: boolean;
  activeAudioId: string | null;
  onPlayAudio: (id: string) => void;
}) {
  const { quote, name, role, avatar, audioSrc, metrics } = testimonial;

  return (
    <div
      aria-hidden={!isActive}
      className="relative flex min-h-[258px] w-[min(88vw,600px)] flex-col overflow-hidden rounded-[1.35rem] border border-foreground/[0.12] bg-[linear-gradient(145deg,rgb(var(--foreground)/0.08),rgb(var(--foreground)/0.035)_42%,rgb(var(--background)/0.82))] p-7 shadow-[0_34px_120px_-68px_rgb(var(--foreground)/0.5),0_34px_95px_-54px_rgba(0,0,0,0.95)] backdrop-blur-xl sm:min-h-[270px] sm:p-9 lg:shadow-[0_28px_80px_-56px_rgba(0,0,0,0.98),0_16px_42px_-32px_rgba(0,0,0,0.9)]"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-foreground/25 to-transparent"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,transparent,rgb(var(--foreground)/0.035)_46%,transparent_70%)]"
      />
      <div className="relative z-10 flex flex-1 flex-col">
      {/* Decorative opening quote mark. */}
      <span
        aria-hidden
        className="font-display text-5xl leading-none text-accent/85"
      >
        &ldquo;
      </span>

      <blockquote className="mt-2 font-display text-xl font-medium leading-relaxed tracking-tightest text-foreground sm:text-2xl">
        {quote}
      </blockquote>

      {audioSrc && (
        <AudioPlayer
          id={testimonial.id}
          src={audioSrc}
          activeId={activeAudioId}
          onPlay={onPlayAudio}
        />
      )}

      <div className="mt-auto flex items-center gap-3.5 pt-7">
        {/* Placeholder avatar — swap for a real photo via `avatar`. */}
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt=""
            className="h-11 w-11 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-foreground/[0.14] bg-foreground/[0.07] text-muted shadow-[inset_0_1px_0_rgb(var(--foreground)/0.08)]">
            <User className="h-5 w-5" strokeWidth={1.5} aria-hidden />
          </span>
        )}

        <div className="min-w-0">
          <p className="truncate font-sans text-sm font-medium text-foreground">
            {name}
          </p>
          <p className="truncate text-xs font-light text-muted">{role}</p>
        </div>
      </div>

      {metrics && metrics.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {metrics.map((metric) => (
            <span
              key={metric}
              className="rounded-full border border-accent/30 bg-accent/[0.08] px-3 py-1 text-[0.7rem] font-medium text-accent"
            >
              {metric}
            </span>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
