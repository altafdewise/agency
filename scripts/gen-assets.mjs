/**
 * Generates brand assets from public/Logo/logo.png (the black "7." on transparent):
 *   - public/Logo/logo-full.png    tight-cropped full mark (with dot), for the nav
 *   - app/icon.png (512)           favicon — bone mark on the dark bg
 *   - app/apple-icon.png (180)     apple touch icon
 *   - app/opengraph-image.png      1200x630 OG card (placeholder — swap later)
 *
 * Run: node scripts/gen-assets.mjs
 */
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const SRC = path.join(root, "public", "Logo", "logo.png");

const BONE = { r: 242, g: 238, b: 227 };
const BG = { r: 10, g: 10, b: 10, alpha: 1 }; // #0A0A0A

// ── tight-crop the full mark (alpha-based) ─────────────────────────────────
const { data, info } = await sharp(SRC)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: ch } = info;

let minX = W, minY = H, maxX = 0, maxY = 0;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    if (data[(y * W + x) * ch + 3] > 128) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}
const pad = Math.round(Math.max(W, H) * 0.012);
minX = Math.max(0, minX - pad);
minY = Math.max(0, minY - pad);
maxX = Math.min(W - 1, maxX + pad);
maxY = Math.min(H - 1, maxY + pad);
const cw = maxX - minX + 1;
const chh = maxY - minY + 1;

const fullMark = await sharp(SRC)
  .extract({ left: minX, top: minY, width: cw, height: chh })
  .png()
  .toBuffer();
await sharp(fullMark).toFile(path.join(root, "public", "Logo", "logo-full.png"));

// ── recolour the mark to bone (keep alpha) ─────────────────────────────────
const { data: alpha } = await sharp(fullMark)
  .extractChannel("alpha")
  .raw()
  .toBuffer({ resolveWithObject: true });
const boneMark = await sharp({
  create: { width: cw, height: chh, channels: 3, background: BONE },
})
  .joinChannel(alpha, { raw: { width: cw, height: chh, channels: 1 } })
  .png()
  .toBuffer();

// ── favicon + apple icon (bone mark centred on dark) ───────────────────────
async function iconAt(size, out) {
  const mark = await sharp(boneMark)
    .resize({ width: Math.round(size * 0.6), height: Math.round(size * 0.6), fit: "inside" })
    .png()
    .toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: mark, gravity: "center" }])
    .png()
    .toFile(path.join(root, "app", out));
}
await iconAt(512, "icon.png");
await iconAt(180, "apple-icon.png");

// ── OG card (1200x630) — placeholder; swap with a designed version later ────
const ogMark = await sharp(boneMark)
  .resize({ height: 300, fit: "inside" })
  .png()
  .toBuffer();
const ogMarkMeta = await sharp(ogMark).metadata();
const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <text x="470" y="296" font-family="Georgia, 'Times New Roman', serif" font-size="66" font-weight="600" fill="#F2EEE3" letter-spacing="-2">one studio.</text>
  <text x="470" y="374" font-family="Georgia, 'Times New Roman', serif" font-size="66" font-weight="600" fill="#F2EEE3" letter-spacing="-2">from idea to launch.</text>
  <text x="472" y="436" font-family="Arial, sans-serif" font-size="24" letter-spacing="6" fill="#9B9B9B">MAGGIE.AGENCY</text>
</svg>`;
await sharp({ create: { width: 1200, height: 630, channels: 4, background: BG } })
  .composite([
    { input: ogMark, left: 150, top: Math.round((630 - (ogMarkMeta.height ?? 300)) / 2) },
    { input: Buffer.from(svg), top: 0, left: 0 },
  ])
  .png()
  .toFile(path.join(root, "app", "opengraph-image.png"));

console.log(`logo-full.png ${cw}x${chh} + app/icon.png, apple-icon.png, opengraph-image.png generated.`);
