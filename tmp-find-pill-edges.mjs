import sharp from "sharp";
const home1 = "c:/Users/Asus/Pictures/HOME (1).png";
const { data, info } = await sharp(home1)
  .extract({ left: 100, top: 708, width: 1700, height: 70 })
  .raw()
  .toBuffer({ resolveWithObject: true });
const w = info.width;
const h = info.height;
for (let y = 0; y < h; y++) {
  let segments = [];
  let inSeg = false;
  let start = 0;
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 3;
    const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const isBg = lum > 232;
    if (!isBg && !inSeg) { inSeg = true; start = x; }
    if (isBg && inSeg) { inSeg = false; if (x - start > 20) segments.push([start + 100, x + 100]); }
  }
  if (segments.length >= 3) {
    console.log(`y=${708 + y}`, segments.map((s) => `${s[0]}-${s[1]}`).join(" | "));
  }
}