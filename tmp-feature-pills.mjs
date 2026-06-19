import sharp from "sharp";

const home1 = "c:/Users/Asus/Pictures/HOME (1).png";

// Find pill rectangles by scanning for non-bg pixels
const { data, info } = await sharp(home1)
  .extract({ left: 60, top: 705, width: 1770, height: 90 })
  .raw()
  .toBuffer({ resolveWithObject: true });

const w = info.width;
const h = info.height;
const bg = 237;

// For each column, find y ranges with content
const pills = [];
let inPill = false;
let startX = 0;

for (let x = 0; x < w; x++) {
  let hasContent = false;
  for (let y = 0; y < h; y++) {
    const i = (y * w + x) * 3;
    const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
    if (Math.abs(lum - bg) > 8) hasContent = true;
  }
  if (hasContent && !inPill) { inPill = true; startX = x; }
  if (!hasContent && inPill) { inPill = false; pills.push([startX + 60, x + 60]); }
}
if (inPill) pills.push([startX + 60, w + 60]);

console.log("Pill x ranges (absolute):", pills);

for (const [x1, x2] of pills) {
  const mid = Math.floor((x1 + x2) / 2);
  const s = await sharp(home1).extract({ left: mid - 20, top: 720, width: 40, height: 40 }).stats();
  console.log(`pill@${mid}`, s.channels.slice(0, 3).map((c) => Math.round(c.mean)).join(","));
}