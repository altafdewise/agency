/**
 * Derives the animated-logo assets from public/Logo/logo.png (the raw "7." mark).
 *
 * Outputs:
 *   - public/Logo/logo-mark.png  -> the "7" WITHOUT its dot, as a tight-cropped
 *                                    black-on-transparent alpha mask (so it can be
 *                                    recoloured to bone via a CSS mask + glow).
 *   - prints LOGO_GEOMETRY        -> the dot's rest position + radius expressed as
 *                                    fractions of the cropped mark box, plus the box
 *                                    aspect ratio. Paste these into components/Logo.tsx.
 *
 * Run: node scripts/analyze-logo.mjs
 */
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, "..", "public", "Logo", "logo.png");
const OUT = path.join(__dirname, "..", "public", "Logo", "logo-mark.png");

const img = sharp(SRC);
const meta = await img.metadata();
const W = meta.width;
const H = meta.height;
const { data, info } = await img
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const ch = info.channels; // 4

// --- decide what counts as "ink" -------------------------------------------
// Sample a corner to learn the background.
const corner = (x, y) => {
  const i = (y * W + x) * ch;
  return { r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] };
};
const bg = corner(4, 4);
const transparentBg = bg.a < 50;
const isInk = (i) => {
  const a = data[i + 3];
  if (transparentBg) return a > 128;
  // opaque (white) background -> ink is the dark mark
  const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  return a > 128 && lum < 128;
};

// --- full-res bounding box of the whole mark --------------------------------
let minX = W, minY = H, maxX = 0, maxY = 0;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (isInk((y * W + x) * ch)) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

// --- connected components on a downsampled grid to isolate the dot ----------
const S = 450; // analysis grid
const sx = W / S, sy = H / S;
const grid = new Uint8Array(S * S);
for (let gy = 0; gy < S; gy++) {
  for (let gx = 0; gx < S; gx++) {
    const px = Math.min(W - 1, Math.floor(gx * sx));
    const py = Math.min(H - 1, Math.floor(gy * sy));
    grid[gy * S + gx] = isInk((py * W + px) * ch) ? 1 : 0;
  }
}
// flood fill -> labelled components
const label = new Int32Array(S * S).fill(0);
let next = 0;
const comps = [];
const stack = [];
for (let i = 0; i < S * S; i++) {
  if (grid[i] && !label[i]) {
    next++;
    let count = 0, bx0 = S, by0 = S, bx1 = 0, by1 = 0, sumx = 0, sumy = 0;
    stack.push(i);
    label[i] = next;
    while (stack.length) {
      const p = stack.pop();
      const px = p % S, py = (p / S) | 0;
      count++;
      sumx += px; sumy += py;
      if (px < bx0) bx0 = px; if (px > bx1) bx1 = px;
      if (py < by0) by0 = py; if (py > by1) by1 = py;
      const nb = [p - 1, p + 1, p - S, p + S];
      for (const q of nb) {
        if (q < 0 || q >= S * S) continue;
        // avoid horizontal wrap
        if ((q === p - 1 && px === 0) || (q === p + 1 && px === S - 1)) continue;
        if (grid[q] && !label[q]) { label[q] = next; stack.push(q); }
      }
    }
    comps.push({ id: next, count, bx0, by0, bx1, by1, cx: sumx / count, cy: sumy / count });
  }
}
comps.sort((a, b) => b.count - a.count);
// The "7" is the largest component. The dot is a smaller, roughly square,
// lower-right component. Score the rest by roundness + lower-right position.
const seven = comps[0];
const candidates = comps.slice(1).filter((c) => c.count > 4);
const score = (c) => {
  const w = c.bx1 - c.bx0 + 1, h = c.by1 - c.by0 + 1;
  const aspect = Math.min(w, h) / Math.max(w, h); // ~1 for a circle
  const lowerRight = c.cx / S + c.cy / S; // bigger = more lower-right
  return aspect * 2 + lowerRight;
};
candidates.sort((a, b) => score(b) - score(a));
const dot = candidates[0];
if (!dot) throw new Error("Could not isolate the dot component.");

// dot geometry in full-res pixels
const dotCxPx = dot.cx * sx;
const dotCyPx = dot.cy * sy;
const dotRPx = (((dot.bx1 - dot.bx0 + 1) * sx) + ((dot.by1 - dot.by0 + 1) * sy)) / 4;

// --- build the dot-less alpha mask, cropped to the full mark bbox -----------
const pad = Math.round(Math.max(W, H) * 0.015); // tiny breathing room
const cropX0 = Math.max(0, minX - pad);
const cropY0 = Math.max(0, minY - pad);
const cropX1 = Math.min(W - 1, maxX + pad);
const cropY1 = Math.min(H - 1, maxY + pad);
const cw = cropX1 - cropX0 + 1;
const chh = cropY1 - cropY0 + 1;

const eraseR = dotRPx * 1.25; // erase a touch beyond the dot so no fringe remains
const out = Buffer.alloc(cw * chh * 4, 0);
for (let y = 0; y < chh; y++) {
  for (let x = 0; x < cw; x++) {
    const srcX = cropX0 + x, srcY = cropY0 + y;
    const si = (srcY * W + srcX) * ch;
    let a = isInk(si) ? 255 : 0;
    // erase the dot
    const dx = srcX - dotCxPx, dy = srcY - dotCyPx;
    if (dx * dx + dy * dy <= eraseR * eraseR) a = 0;
    const oi = (y * cw + x) * 4;
    out[oi] = 0; out[oi + 1] = 0; out[oi + 2] = 0; out[oi + 3] = a;
  }
}
await sharp(out, { raw: { width: cw, height: chh, channels: 4 } })
  .png()
  .toFile(OUT);

// --- geometry relative to the cropped box -----------------------------------
const geom = {
  boxAspect: +(cw / chh).toFixed(4),       // width / height of logo-mark.png
  dotCxPct: +(((dotCxPx - cropX0) / cw) * 100).toFixed(2),
  dotCyPct: +(((dotCyPx - cropY0) / chh) * 100).toFixed(2),
  dotRPctW: +((dotRPx / cw) * 100).toFixed(2), // dot radius as % of box width
};
console.log("transparentBg:", transparentBg, "| src:", W + "x" + H);
console.log("cropped mark:", cw + "x" + chh, "-> public/Logo/logo-mark.png");
console.log("LOGO_GEOMETRY =", JSON.stringify(geom, null, 2));
