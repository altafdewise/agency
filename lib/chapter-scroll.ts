/** A small, interruptible assist at chapter edges. The document is always the scroller. */
export const CHAPTER_SETTLE_MS = 450;

export function chapterTarget(
  tops: number[],
  from: number,
  current: number,
  direction: number,
  viewport: number,
) {
  if (!direction || Math.abs(current - from) < 18) return null;
  const candidates = tops.filter((top) => direction > 0 ? top > from + 8 : top < from - 8);
  const target = direction > 0 ? candidates[0] : candidates.at(-1);
  if (target === undefined) return null;
  const remaining = (target - current) * direction;
  const travel = (current - from) * direction;
  // Never skip a tall composition. Only assist an approaching chapter edge,
  // or complete a clear gesture between two neighbouring viewport-sized scenes.
  const nearEdge = remaining >= -viewport * 0.18 && remaining <= viewport * 0.55;
  const pageTurn = Math.abs(target - from) <= viewport * 1.15 && travel >= viewport * 0.14;
  return (nearEdge || (pageTurn && remaining > 0)) && Math.abs(target - current) > 2
    ? target
    : null;
}

export function attachChapterScroll(root: HTMLElement) {
  const doc = root.ownerDocument;
  const win = doc.defaultView;
  if (!win || !win.requestAnimationFrame || !win.matchMedia) return () => {};
  const reduced = win.matchMedia("(prefers-reduced-motion: reduce)");
  let phase: "native" | "gliding" | "settling" = "native";
  let frame = 0;
  let idleTimer = 0;
  let holdTimer = 0;
  let blockedUntil = 0;
  let from = win.scrollY;
  let previousY = from;
  let direction = 0;
  let gestureActive = false;
  let touching = false;
  let lastInput = -Infinity;
  let burstStart = 0;
  let burstDistance = 0;
  let touchY = 0;
  let touchX = 0;
  let touchStart = 0;
  let targetY = 0;
  let lastWidth = win.innerWidth;
  let lastHeight = win.innerHeight;

  const now = () => win.performance.now();
  const setPhase = (value: typeof phase) => {
    phase = value;
    root.dataset.scrollPhase = value;
  };
  const cancel = (cooldown = 0) => {
    win.cancelAnimationFrame(frame);
    win.clearTimeout(idleTimer);
    win.clearTimeout(holdTimer);
    frame = idleTimer = holdTimer = 0;
    setPhase("native");
    gestureActive = false;
    previousY = win.scrollY;
    blockedUntil = now() + cooldown;
  };
  const eligible = () => !reduced.matches && !doc.hidden &&
    (win.visualViewport?.scale ?? 1) === 1 && now() >= blockedUntil;

  const begin = (delta: number) => {
    if (!gestureActive) {
      from = win.scrollY;
      previousY = from;
      gestureActive = true;
    }
    if (delta) direction = Math.sign(delta);
  };

  const settle = () => {
    frame = 0;
    setPhase("settling");
    // Only residual momentum is damped. A fresh gesture immediately releases this.
    holdTimer = win.setTimeout(() => cancel(), CHAPTER_SETTLE_MS);
  };

  const glide = (target: number) => {
    const startY = win.scrollY;
    const started = now();
    const duration = Math.min(620, 380 + Math.abs(target - startY) * 0.3);
    targetY = target;
    gestureActive = false;
    setPhase("gliding");
    let lastFrame = started;
    const tick = (time: number) => {
      // Fall back to native on a struggling device or an interrupted/hidden tab.
      if (!eligible() || touching || time - lastFrame > 160) {
        cancel(800);
        return;
      }
      lastFrame = time;
      const t = Math.min(1, (time - started) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      win.scrollTo({ top: startY + (target - startY) * eased, behavior: "instant" });
      if (t < 1) frame = win.requestAnimationFrame(tick);
      else settle();
    };
    frame = win.requestAnimationFrame(tick);
  };

  const finishGesture = () => {
    idleTimer = 0;
    if (!eligible() || touching || !gestureActive || phase !== "native") return;
    const tops = Array.from(root.querySelectorAll<HTMLElement>("[data-chapter]"))
      .map((chapter) => chapter.getBoundingClientRect().top + win.scrollY);
    const target = chapterTarget(tops, from, win.scrollY, direction, win.innerHeight);
    gestureActive = false;
    if (target !== null && target <= doc.documentElement.scrollHeight - win.innerHeight + 2) {
      glide(target);
    }
  };

  const queueFinish = () => {
    win.clearTimeout(idleTimer);
    idleTimer = win.setTimeout(finishGesture, 120);
  };

  const isNestedControl = (target: EventTarget | null) => {
    let element = target instanceof Element ? target : null;
    if (element?.closest("input, textarea, select, button, a, [contenteditable='true'], [data-native-scroll]")) return true;
    while (element && element !== root && element !== doc.body) {
      const style = win.getComputedStyle(element);
      if (/(auto|scroll)/.test(style.overflowY) && element.scrollHeight > element.clientHeight + 2) return true;
      element = element.parentElement;
    }
    return false;
  };

  const onWheel = (event: WheelEvent) => {
    const time = now();
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? win.innerHeight : 1);
    const gap = time - lastInput;
    if (gap > 180 || time - burstStart > 160) {
      burstStart = time;
      burstDistance = 0;
    }
    burstDistance += Math.abs(delta);
    const rapid = Math.abs(delta) > 180 || burstDistance > 360;
    lastInput = time;
    if (event.ctrlKey || event.metaKey || Math.abs(event.deltaX) > Math.abs(delta) ||
      isNestedControl(event.target) || rapid) {
      cancel(1000);
      return;
    }
    if (phase !== "native") {
      if (gap > 160 || (delta && Math.sign(delta) !== direction)) {
        // Let an interruption travel natively instead of immediately targeting
        // another chapter, especially when the user reverses mid-glide.
        cancel(300);
        return;
      } else {
        if (event.cancelable) event.preventDefault();
        else cancel(800);
        return;
      }
    }
    if (eligible()) {
      begin(delta);
      queueFinish();
    }
  };

  const onTouchStart = (event: TouchEvent) => {
    cancel();
    touching = true;
    if (event.touches.length !== 1 || isNestedControl(event.target)) {
      blockedUntil = now() + 1500;
      return;
    }
    touchY = event.touches[0].clientY;
    touchX = event.touches[0].clientX;
    touchStart = now();
    if (eligible()) begin(0);
  };
  const onTouchMove = (event: TouchEvent) => {
    if (event.touches.length !== 1 || !gestureActive) return;
    const delta = touchY - event.touches[0].clientY;
    const elapsed = Math.max(1, now() - touchStart);
    if (Math.abs(touchX - event.touches[0].clientX) > Math.abs(delta) + 10 ||
      (Math.abs(delta) > 60 && Math.abs(delta) / elapsed > 0.9)) {
      cancel(1200);
      return;
    }
    if (Math.abs(delta) > 10) direction = Math.sign(delta);
    lastInput = now();
  };
  const onTouchEnd = () => {
    touching = false;
    if (gestureActive) queueFinish();
  };
  const onTouchCancel = () => { touching = false; cancel(1000); };
  const onScroll = () => {
    if (phase === "gliding") return;
    if (phase === "settling") {
      const drift = Math.abs(win.scrollY - targetY);
      if (drift > 32) cancel(1000);
      else if (drift > 1 && !frame) {
        frame = win.requestAnimationFrame(() => {
          frame = 0;
          if (phase === "settling") win.scrollTo({ top: targetY, behavior: "instant" });
        });
      }
      return;
    }
    if (!gestureActive || !eligible()) return;
    const delta = win.scrollY - previousY;
    if (Math.abs(delta) > 2) direction = Math.sign(delta);
    previousY = win.scrollY;
    queueFinish();
  };
  const onKey = () => cancel(1200);
  const onPointer = (event: PointerEvent) => {
    if (event.pointerType !== "touch") cancel(1200);
  };
  const onNavigate = () => cancel(1200);
  const onResize = () => {
    // Browser chrome expanding on phones must not retime the chapter layout.
    if (lastWidth !== win.innerWidth || Math.abs(lastHeight - win.innerHeight) > 120) cancel(1000);
    lastWidth = win.innerWidth;
    lastHeight = win.innerHeight;
  };

  setPhase("native");
  win.addEventListener("wheel", onWheel, { passive: false });
  win.addEventListener("touchstart", onTouchStart, { passive: true });
  win.addEventListener("touchmove", onTouchMove, { passive: true });
  win.addEventListener("touchend", onTouchEnd, { passive: true });
  win.addEventListener("touchcancel", onTouchCancel, { passive: true });
  win.addEventListener("scroll", onScroll, { passive: true });
  win.addEventListener("keydown", onKey);
  win.addEventListener("pointerdown", onPointer, { passive: true });
  win.addEventListener("resize", onResize);
  win.addEventListener("hashchange", onNavigate);
  win.addEventListener("popstate", onNavigate);
  doc.addEventListener("visibilitychange", onNavigate);
  doc.addEventListener("click", onNavigate);
  reduced.addEventListener("change", onNavigate);

  return () => {
    cancel();
    delete root.dataset.scrollPhase;
    win.removeEventListener("wheel", onWheel);
    win.removeEventListener("touchstart", onTouchStart);
    win.removeEventListener("touchmove", onTouchMove);
    win.removeEventListener("touchend", onTouchEnd);
    win.removeEventListener("touchcancel", onTouchCancel);
    win.removeEventListener("scroll", onScroll);
    win.removeEventListener("keydown", onKey);
    win.removeEventListener("pointerdown", onPointer);
    win.removeEventListener("resize", onResize);
    win.removeEventListener("hashchange", onNavigate);
    win.removeEventListener("popstate", onNavigate);
    doc.removeEventListener("visibilitychange", onNavigate);
    doc.removeEventListener("click", onNavigate);
    reduced.removeEventListener("change", onNavigate);
  };
}
