/** Small, allocation-free helpers for scroll-driven opacity windows. */
export function fadeIn(value: number, start: number, end: number) {
  if (value <= start) return 0;
  if (value >= end) return 1;
  return (value - start) / (end - start);
}

export function fadeOut(value: number, start: number, end: number) {
  if (value <= start) return 1;
  if (value >= end) return 0;
  return 1 - (value - start) / (end - start);
}

export function fadeInOut(
  value: number,
  start: number,
  visibleAt: number,
  fadeAt: number,
  end: number
) {
  if (value <= start || value >= end) return 0;
  if (value < visibleAt) return (value - start) / (visibleAt - start);
  if (value <= fadeAt) return 1;
  return 1 - (value - fadeAt) / (end - fadeAt);
}
