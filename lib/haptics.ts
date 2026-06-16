/**
 * Very subtle mobile haptics. Wraps the Vibration API and no-ops everywhere it
 * isn't supported (desktop, iOS Safari) — so callers never need to guard.
 * Keep it to meaningful confirm actions only (select, advance, stage reached).
 */
export function tick(duration = 12) {
  if (typeof window === "undefined") return;
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function")
    return;
  // Respect reduced-motion: skip the buzz for users who opted out of motion.
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  try {
    navigator.vibrate(duration);
  } catch {
    /* no-op */
  }
}
