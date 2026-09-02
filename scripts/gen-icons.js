// Generates the PWA icon set (no image deps — hand-rolled PNG encoder).
// Run: node scripts/gen-icons.js
const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

const CRC = (() => {
  const t = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};

function png(size, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  const stride = size * 4;
  const raw = Buffer.alloc(size * (1 + stride));
  for (let y = 0; y < size; y++) rgba.copy(raw, y * (1 + stride) + 1, y * stride, (y + 1) * stride);
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

const mix = (a, b, t) => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
];

function render(size) {
  const buf = Buffer.alloc(size * size * 4);
  const cx = size / 2, cy = size / 2;
  const bgTop = [39, 158, 103];      // subtle vertical sheen
  const bgBot = [24, 118, 76];
  const ball = [233, 240, 238];      // #E9F0EE
  const shade = [198, 214, 208];
  const dimple = [26, 122, 80];
  const ballR = size * 0.30;
  const dr = size * 0.04;
  const ring = ballR * 0.5;
  const dimples = [[0, 0]];
  for (let k = 0; k < 6; k++) {
    const a = (Math.PI / 3) * k - Math.PI / 6;
    dimples.push([Math.cos(a) * ring, Math.sin(a) * ring]);
  }
  const dimplePts = dimples.map(([dx, dy]) => [cx + dx, cy + dy]);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      let c = mix(bgTop, bgBot, y / size);
      const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      if (d < ballR + 1) {
        const edge = Math.min(1, Math.max(0, ballR + 0.5 - d));
        // soft spherical shading, light from upper-left
        const sx = (x - cx) / ballR, sy = (y - cy) / ballR;
        const lum = Math.max(0, 1 - (sx * 0.55 + sy * 0.55 + 0.15));
        let bc = mix(shade, ball, Math.min(1, 0.35 + lum));
        for (const [px, py] of dimplePts) {
          const dd = Math.hypot(x + 0.5 - px, y + 0.5 - py);
          if (dd < dr + 1) bc = mix(bc, dimple, Math.min(1, Math.max(0, dr + 0.5 - dd)) * 0.9);
        }
        c = mix(c, bc, edge);
      }
      buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2]; buf[i + 3] = 255;
    }
  }
  return buf;
}

const pub = path.join(__dirname, "..", "public");
for (const s of [192, 512]) fs.writeFileSync(path.join(pub, `icon-${s}.png`), png(s, render(s)));
fs.writeFileSync(path.join(pub, "apple-touch-icon.png"), png(180, render(180)));
fs.writeFileSync(path.join(pub, "favicon-32.png"), png(32, render(32)));
console.log("wrote public/icon-192.png, icon-512.png, apple-touch-icon.png, favicon-32.png");
