import sharp from "sharp";

const mockup = "c:/Users/Asus/Pictures/HOME (1).png";

// Sample average color per horizontal band to find section boundaries
const { data, info } = await sharp(mockup).resize(189, 106).raw().toBuffer({ resolveWithObject: true });
const w = info.width;
const h = info.height;
for (let y = 0; y < h; y++) {
  let dark = 0;
  let bright = 0;
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 3;
    const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
    if (lum < 100) dark++;
    if (lum > 220) bright++;
  }
  if (dark > 5 || y % 3 === 0) {
    console.log(`y=${y} dark=${dark} bright=${bright}`);
  }
}