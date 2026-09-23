import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

// Exercise the actual controller with deterministic input and frame timing,
// without a browser dependency or changing the production module for tests.
const source = readFileSync(new URL("../lib/chapter-scroll.ts", import.meta.url), "utf8");
class Surface {
  listeners = new Map();
  addEventListener(type, handler) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(handler);
  }
  removeEventListener(type, handler) { this.listeners.get(type)?.delete(handler); }
  emit(type, values = {}) {
    const event = { cancelable: true, defaultPrevented: false,
      preventDefault() { this.defaultPrevented = true; }, ...values };
    this.listeners.get(type)?.forEach((handler) => handler(event));
    return event;
  }
  count() { return [...this.listeners.values()].reduce((sum, group) => sum + group.size, 0); }
}
class Element extends Surface {
  dataset = {};
  closest() { return null; }
}
const compiled = { exports: {} };
vm.runInNewContext(ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, { exports: compiled.exports, Element });
const { chapterTarget, attachChapterScroll, CHAPTER_SETTLE_MS } = compiled.exports;

function scene({ width = 390, height = 844, reduced = false, tops = [0, 844, 2500, 3344] } = {}) {
  let clock = 0;
  let nextId = 0;
  const pending = new Map();
  const schedule = (fn, delay) => { pending.set(++nextId, { fn, at: clock + delay }); return nextId; };
  const win = new Surface();
  const doc = new Surface();
  const media = new Surface();
  media.matches = reduced;
  Object.assign(win, {
    innerWidth: width, innerHeight: height, scrollY: 0, visualViewport: { scale: 1 },
    performance: { now: () => clock }, matchMedia: () => media,
    getComputedStyle: () => ({ overflowY: "visible" }),
    setTimeout: schedule, clearTimeout: (id) => pending.delete(id),
    requestAnimationFrame: (fn) => schedule(() => fn(clock), 16),
    cancelAnimationFrame: (id) => pending.delete(id),
    scrollTo: ({ top }) => { win.scrollY = top; win.emit("scroll"); },
  });
  Object.assign(doc, { defaultView: win, hidden: false, documentElement: { scrollHeight: 5000 } });
  const root = new Element();
  root.ownerDocument = doc;
  doc.body = root;
  root.querySelectorAll = () => tops.map((top) => ({ getBoundingClientRect: () => ({ top: top - win.scrollY }) }));
  const cleanup = attachChapterScroll(root);
  const advance = (ms) => {
    const until = clock + ms;
    while (true) {
      const entry = [...pending.entries()].filter(([, item]) => item.at <= until)
        .sort((a, b) => a[1].at - b[1].at)[0];
      if (!entry) break;
      pending.delete(entry[0]);
      clock = entry[1].at;
      entry[1].fn();
    }
    clock = until;
  };
  const wheel = (deltaY, more = {}) => {
    const event = win.emit("wheel", { deltaY, deltaX: 0, deltaMode: 0, target: root, ...more });
    if (!event.defaultPrevented) win.scrollTo({ top: win.scrollY + deltaY });
    return event;
  };
  const touch = (type, x, y) => win.emit(type, { target: root,
    touches: type === "touchend" ? [] : [{ clientX: x, clientY: y }] });
  return { win, doc, root, media, advance, wheel, touch, cleanup, pending };
}

test("chapter selection is directional and never jumps across unread tall content", () => {
  assert.equal(chapterTarget([0, 844, 2500], 0, 126, 1, 844), 844);
  assert.equal(chapterTarget([0, 844, 2500], 844, 1000, 1, 844), null);
  assert.equal(chapterTarget([0, 844, 2500], 1900, 2100, 1, 844), 2500);
  assert.equal(chapterTarget([0, 844, 2500], 1200, 1000, -1, 844), 844);
  assert.equal(chapterTarget([0, 844, 2500], 844, 848, 1, 844), null);
  assert.equal(chapterTarget([0, 844, 2500], 0, 2100, 1, 844), null);
  assert.equal(chapterTarget([0, 844, 2500], 0, 844, 1, 844), null);
});

for (const [width, height] of [[320, 568], [375, 812], [390, 844], [430, 932]]) {
  test(`${width}px: gentle gesture glides precisely, holds 450ms, then releases`, () => {
    const s = scene({ width, height, tops: [0, height, height * 3] });
    const distance = height * 0.15;
    s.wheel(distance);
    assert.equal(s.win.scrollY, distance, "initial input stays native");
    s.advance(120);
    assert.equal(s.root.dataset.scrollPhase, "gliding");
    while (s.root.dataset.scrollPhase === "gliding") s.advance(16);
    assert.equal(s.win.scrollY, height);
    s.advance(CHAPTER_SETTLE_MS - 1);
    assert.equal(s.root.dataset.scrollPhase, "settling");
    s.advance(1);
    assert.equal(s.root.dataset.scrollPhase, "native");
    s.cleanup();
  });
}

test("slow touch swipes stay native while the finger is down, then settle", () => {
  const s = scene();
  s.touch("touchstart", 150, 600);
  s.advance(250);
  s.touch("touchmove", 150, 430);
  s.win.scrollTo({ top: 170 });
  s.advance(150);
  assert.equal(s.root.dataset.scrollPhase, "native");
  s.touch("touchend");
  s.advance(120);
  assert.equal(s.root.dataset.scrollPhase, "gliding");
  s.advance(650);
  assert.equal(s.win.scrollY, 844);
  assert.equal(s.root.dataset.scrollPhase, "settling");
});

test("rapid swipe bypasses both glide and hold", () => {
  const s = scene();
  s.touch("touchstart", 150, 600);
  s.advance(50);
  s.touch("touchmove", 150, 400);
  s.win.scrollTo({ top: 220 });
  s.touch("touchend");
  s.advance(1500);
  assert.equal(s.win.scrollY, 220);
  assert.equal(s.root.dataset.scrollPhase, "native");
});

test("fast wheel and trackpad bursts remain native", () => {
  for (const deltas of [[240], [130, 130, 130]]) {
    const s = scene();
    for (const delta of deltas) { s.wheel(delta); s.advance(25); }
    s.advance(1000);
    assert.equal(s.win.scrollY, deltas.reduce((a, b) => a + b));
    assert.equal(s.root.dataset.scrollPhase, "native");
  }
});

test("fresh wheel, reversed wheel, touch and keyboard interrupt immediately", () => {
  for (const input of ["wheel", "reverse", "touch", "keyboard"]) {
    const s = scene();
    s.wheel(126);
    s.advance(760);
    assert.equal(s.root.dataset.scrollPhase, "settling");
    if (input === "wheel") assert.equal(s.wheel(90).defaultPrevented, false);
    if (input === "reverse") assert.equal(s.wheel(-90).defaultPrevented, false);
    if (input === "touch") s.touch("touchstart", 100, 500);
    if (input === "keyboard") s.win.emit("keydown", { key: "PageDown" });
    assert.equal(s.root.dataset.scrollPhase, "native", input);
  }
});

test("tiny residual motion is stabilized, meaningful movement releases the hold", () => {
  const s = scene();
  s.wheel(126);
  s.advance(760);
  s.win.scrollTo({ top: 849 });
  s.advance(16);
  assert.equal(s.win.scrollY, 844);
  s.win.scrollTo({ top: 900 });
  assert.equal(s.root.dataset.scrollPhase, "native");
  s.advance(500);
  assert.equal(s.win.scrollY, 900);
});

test("reduced motion, zoom, hidden tabs and nested controls never start an assist", () => {
  for (const mode of ["reduced", "zoom", "hidden", "control"]) {
    const s = scene({ reduced: mode === "reduced" });
    if (mode === "zoom") s.win.visualViewport.scale = 2;
    if (mode === "hidden") s.doc.hidden = true;
    if (mode === "control") s.root.closest = () => s.root;
    s.wheel(126);
    s.advance(1000);
    assert.equal(s.win.scrollY, 126, mode);
    assert.equal(s.root.dataset.scrollPhase, "native", mode);
  }
});

test("viewport rotation cancels while small browser-toolbar changes do not", () => {
  const s = scene();
  s.wheel(126);
  s.advance(150);
  s.win.innerHeight -= 40;
  s.win.emit("resize");
  assert.equal(s.root.dataset.scrollPhase, "gliding");
  s.win.innerWidth = 844;
  s.win.emit("resize");
  assert.equal(s.root.dataset.scrollPhase, "native");
});

test("unmount cancels animation and removes all listeners and timers", () => {
  const s = scene();
  s.wheel(126);
  s.advance(150);
  const y = s.win.scrollY;
  s.cleanup();
  s.advance(2000);
  assert.equal(s.win.scrollY, y);
  assert.equal(s.win.count() + s.doc.count() + s.media.count(), 0);
  assert.equal(s.pending.size, 0);
  assert.equal(s.root.dataset.scrollPhase, undefined);
});

test("backward gestures settle at the previous chapter edge", () => {
  const s = scene();
  s.win.scrollTo({ top: 1100 });
  s.wheel(-126);
  s.advance(760);
  assert.equal(s.win.scrollY, 844);
  assert.equal(s.root.dataset.scrollPhase, "settling");
});

test("new input interrupts mid-glide without jumping to the destination", () => {
  for (const input of ["touch", "wheel", "keyboard"]) {
    const s = scene();
    s.wheel(126);
    s.advance(220);
    const y = s.win.scrollY;
    assert.ok(y > 126 && y < 844);
    if (input === "touch") s.touch("touchstart", 100, 500);
    if (input === "wheel") s.wheel(-80);
    if (input === "keyboard") s.win.emit("keydown", { key: "ArrowDown" });
    s.advance(1000);
    assert.ok(s.win.scrollY < 844, input);
    assert.equal(s.root.dataset.scrollPhase, "native", input);
  }
});

test("a reduced-motion preference change immediately cancels an active glide", () => {
  const s = scene();
  s.wheel(126);
  s.advance(220);
  const y = s.win.scrollY;
  s.media.matches = true;
  s.media.emit("change");
  s.advance(1000);
  assert.equal(s.win.scrollY, y);
  assert.equal(s.root.dataset.scrollPhase, "native");
});
