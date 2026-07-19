// Generates valid PNG PWA assets (icons + screenshots) with no external deps.
// Uses only Node built-ins (zlib) to encode PNGs from raw RGBA pixel buffers.
import zlib from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'pwa');
mkdirSync(outDir, { recursive: true });

// ---- Brand palette (matches manifest theme_color) ----
const TEAL = [15, 118, 110, 255]; // #0f766e
const WHITE = [255, 255, 255, 255];
const LIGHT = [240, 253, 250, 255]; // teal-50-ish background for screenshots
const CARD = [255, 255, 255, 255];
const BORDER = [204, 231, 227, 255];

// ---- Tiny software rasterizer over an RGBA buffer ----
function makeCanvas(w, h, bg = [0, 0, 0, 0]) {
  const buf = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    buf[i * 4] = bg[0];
    buf[i * 4 + 1] = bg[1];
    buf[i * 4 + 2] = bg[2];
    buf[i * 4 + 3] = bg[3];
  }
  return { w, h, buf };
}
function px(c, x, y, color) {
  if (x < 0 || y < 0 || x >= c.w || y >= c.h) return;
  const i = (y * c.w + x) * 4;
  const a = color[3] / 255;
  c.buf[i] = Math.round(color[0] * a + c.buf[i] * (1 - a));
  c.buf[i + 1] = Math.round(color[1] * a + c.buf[i + 1] * (1 - a));
  c.buf[i + 2] = Math.round(color[2] * a + c.buf[i + 2] * (1 - a));
  c.buf[i + 3] = Math.max(c.buf[i + 3], color[3]);
}
function fillRect(c, x0, y0, rw, rh, color) {
  for (let y = y0; y < y0 + rh; y++)
    for (let x = x0; x < x0 + rw; x++) px(c, x, y, color);
}
function fillRoundRect(c, x0, y0, rw, rh, r, color) {
  for (let y = y0; y < y0 + rh; y++) {
    for (let x = x0; x < x0 + rw; x++) {
      const dx = Math.min(x - x0, x0 + rw - 1 - x);
      const dy = Math.min(y - y0, y0 + rh - 1 - y);
      if (dx < r && dy < r) {
        const cx = dx < r ? x0 + r : x;
        const cy = dy < r ? y0 + r : y;
        const rx = x < x0 + r ? x0 + r : x0 + rw - 1 - r;
        const ry = y < y0 + r ? y0 + r : y0 + rh - 1 - r;
        if ((x - rx) ** 2 + (y - ry) ** 2 > r * r) continue;
      }
      px(c, x, y, color);
    }
  }
}
// Draw the shield + checkmark motif (scaled to size s) centered on canvas
function drawShield(c, cx, cy, s) {
  const half = s / 2;
  // shield body as a filled polygon (approximate via scanline of a rounded pentagon)
  const top = cy - half;
  const topW = s * 0.55;
  for (let y = 0; y < s; y++) {
    const t = y / s;
    let wRatio;
    if (t < 0.55) wRatio = 1; // straight sides at top
    else wRatio = 1 - (t - 0.55) / 0.45; // taper to a point at bottom
    const w = topW * wRatio;
    const yy = Math.round(top + y);
    for (let x = Math.round(cx - w); x <= Math.round(cx + w); x++) px(c, x, yy, WHITE);
  }
  // checkmark stroke in teal
  const th = Math.max(2, Math.round(s * 0.06));
  const p1 = [cx - s * 0.22, cy - s * 0.02];
  const p2 = [cx - s * 0.05, cy + s * 0.16];
  const p3 = [cx + s * 0.26, cy - s * 0.22];
  strokeLine(c, p1, p2, th, TEAL);
  strokeLine(c, p2, p3, th, TEAL);
}
function strokeLine(c, a, b, th, color) {
  const steps = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]));
  for (let i = 0; i <= steps; i++) {
    const x = a[0] + ((b[0] - a[0]) * i) / steps;
    const y = a[1] + ((b[1] - a[1]) * i) / steps;
    for (let oy = -th; oy <= th; oy++)
      for (let ox = -th; ox <= th; ox++)
        if (ox * ox + oy * oy <= th * th) px(c, Math.round(x + ox), Math.round(y + oy), color);
  }
}

// ---- PNG encoder (RGBA, filter type 0) ----
function encodePNG(c) {
  const { w, h, buf } = c;
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0; // no filter
    buf.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  const chunks = [];
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  chunks.push(chunk('IHDR', ihdr));
  chunks.push(chunk('IDAT', idat));
  chunks.push(chunk('IEND', Buffer.alloc(0)));
  return Buffer.concat([sig, ...chunks]);
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])) >>> 0, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return c ^ 0xffffffff;
}

// ---- Build icons ----
function buildIcon(size, maskable) {
  const c = makeCanvas(size, size, TEAL);
  const r = Math.round(size * (maskable ? 0 : 0.1875)); // maskable = full-bleed square, no rounding
  if (!maskable) {
    // redraw with rounded corners: start transparent, draw rounded teal
    const c2 = makeCanvas(size, size);
    fillRoundRect(c2, 0, 0, size, size, r, TEAL);
    drawShield(c2, size / 2, size / 2, size * 0.62);
    return encodePNG(c2);
  }
  // maskable: keep 20% safe-zone padding, shield smaller & centered on full teal square
  drawShield(c, size / 2, size / 2, size * 0.46);
  return encodePNG(c);
}

// ---- Build screenshots ----
function buildScreenshot(w, h) {
  const c = makeCanvas(w, h, LIGHT);
  // top app bar
  fillRect(c, 0, 0, w, Math.round(h * 0.09), TEAL);
  drawShield(c, Math.round(h * 0.045), Math.round(h * 0.045), Math.round(h * 0.06));
  // content cards grid
  const pad = Math.round(w * 0.04);
  const top = Math.round(h * 0.13);
  const cols = w > h ? 3 : 1;
  const gap = pad;
  const cardW = Math.round((w - pad * 2 - gap * (cols - 1)) / cols);
  const cardH = Math.round(h * 0.16);
  let x = pad;
  let y = top;
  for (let i = 0; i < 6; i++) {
    fillRoundRect(c, x, y, cardW, cardH, Math.round(cardH * 0.12), CARD);
    fillRoundRect(c, x, y, cardW, cardH, Math.round(cardH * 0.12), [0, 0, 0, 0]);
    // border
    for (let bx = x; bx < x + cardW; bx++) { px(c, bx, y, BORDER); px(c, bx, y + cardH - 1, BORDER); }
    for (let by = y; by < y + cardH; by++) { px(c, x, by, BORDER); px(c, x + cardW - 1, by, BORDER); }
    // accent bar
    fillRoundRect(c, x + Math.round(cardW * 0.06), y + Math.round(cardH * 0.2), Math.round(cardW * 0.5), Math.round(cardH * 0.14), 4, TEAL);
    fillRoundRect(c, x + Math.round(cardW * 0.06), y + Math.round(cardH * 0.5), Math.round(cardW * 0.75), Math.round(cardH * 0.1), 4, BORDER);
    x += cardW + gap;
    if ((i + 1) % cols === 0) { x = pad; y += cardH + gap; }
  }
  return encodePNG(c);
}

const assets = [
  ['icon-192.png', buildIcon(192, false)],
  ['icon-512.png', buildIcon(512, false)],
  ['icon-maskable-512.png', buildIcon(512, true)],
  ['screenshot-wide.png', buildScreenshot(1280, 720)],
  ['screenshot-narrow.png', buildScreenshot(720, 1280)],
];
for (const [name, data] of assets) {
  writeFileSync(join(outDir, name), data);
  console.log('wrote', join('public', 'pwa', name), data.length, 'bytes');
}
