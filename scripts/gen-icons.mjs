// Generates the PWA icons (Tiber square with a chalk "Z") without dependencies.
// Usage: node scripts/gen-icons.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const BG = [0x06, 0x39, 0x2f];
const FG = [0xf2, 0xef, 0xe6];
const FRAME = [0x24, 0x24, 0x24];

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size, pixel) {
  const raw = Buffer.alloc(size * (size * 3 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixel(x, y);
      const o = y * (size * 3 + 1) + 1 + x * 3;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const segDist = (px, py, [ax, ay], [bx, by]) => {
  const dx = bx - ax, dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
};
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));

/**
 * @param size   px
 * @param scale  size of the Z relative to the icon (smaller for maskable safe zone)
 * @param radius corner radius relative to size (0 = full bleed)
 */
function icon(size, scale, radius) {
  const ss = 4; // supersampling
  const z = (u, v) => [0.5 + (u - 0.5) * scale, 0.5 + (v - 0.5) * scale];
  const pts = [z(0.25, 0.3), z(0.75, 0.3), z(0.25, 0.7), z(0.75, 0.7)];
  const stroke = 0.075 * scale;
  return png(size, (x, y) => {
    let fg = 0, inside = 0;
    for (let i = 0; i < ss; i++)
      for (let j = 0; j < ss; j++) {
        const u = (x + (i + 0.5) / ss) / size;
        const v = (y + (j + 0.5) / ss) / size;
        if (radius > 0) {
          const cx = Math.min(Math.max(u, radius), 1 - radius);
          const cy = Math.min(Math.max(v, radius), 1 - radius);
          if (Math.hypot(u - cx, v - cy) > radius) continue;
        }
        inside++;
        const d = Math.min(segDist(u, v, pts[0], pts[1]), segDist(u, v, pts[1], pts[2]), segDist(u, v, pts[2], pts[3]));
        if (d < stroke / 2) fg++;
      }
    const n = ss * ss;
    const base = mix(BG, FG, inside ? fg / inside : 0);
    return mix(FRAME, base, inside / n);
  });
}

mkdirSync("public/icons", { recursive: true });
writeFileSync("public/icons/icon-192.png", icon(192, 1, 0.22));
writeFileSync("public/icons/icon-512.png", icon(512, 1, 0.22));
writeFileSync("public/icons/maskable-512.png", icon(512, 0.72, 0));
writeFileSync("public/icons/apple-touch-icon.png", icon(180, 0.9, 0));
writeFileSync(
  "public/icon.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="22" fill="#06392F"/><path d="M25 30h50L25 70h50" fill="none" stroke="#F2EFE6" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round"/></svg>\n`,
);
console.log("icons written to public/");
