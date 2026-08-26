import fs from "fs";
import path from "path";
import zlib from "zlib";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function crc32(buf) {
  let c;
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      t[n] = c >>> 0;
    }
    return t;
  })());
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

// Solid rounded-square-ish flat icon: near-black background, thin white
// horizontal line motif (echoes the KAKU answer-line UI), no external assets.
function buildIcon(size) {
  const bg = [29, 29, 31]; // matches --color-text
  const line = [255, 255, 255];
  const lineY0 = Math.round(size * 0.46);
  const lineY1 = Math.round(size * 0.54);
  const marginX = Math.round(size * 0.22);

  const rowSize = size * 3 + 1; // filter byte + RGB per pixel
  const raw = Buffer.alloc(rowSize * size);

  for (let y = 0; y < size; y++) {
    const rowStart = y * rowSize;
    raw[rowStart] = 0; // filter: none
    const isLineRow = y >= lineY0 && y < lineY1;
    for (let x = 0; x < size; x++) {
      const isLineCol = x >= marginX && x < size - marginX;
      const color = isLineRow && isLineCol ? line : bg;
      const offset = rowStart + 1 + x * 3;
      raw[offset] = color[0];
      raw[offset + 1] = color[1];
      raw[offset + 2] = color[2];
    }
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = zlib.deflateSync(raw);

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const outDir = path.join(__dirname, "..", "public");
for (const size of [192, 512]) {
  const png = buildIcon(size);
  fs.writeFileSync(path.join(outDir, `icon-${size}.png`), png);
  console.log(`wrote icon-${size}.png (${png.length} bytes)`);
}

const appleTouch = buildIcon(180);
fs.writeFileSync(path.join(outDir, "apple-touch-icon.png"), appleTouch);
console.log("wrote apple-touch-icon.png");
