import sharp from "sharp";

const ref = "public/assets/home-reference.png";

// Measure layout bands in HOME(1) reference
const { data, info } = await sharp(ref).resize(189, 106).raw().toBuffer({ resolveWithObject: true });
const w = info.width;
const h = info.height;

console.log("=== HOME(1) reference content bands ===");
for (let y = 0; y < h; y++) {
  let dark = 0;
  let leftDark = 0;
  let rightDark = 0;
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 3;
    const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
    if (lum < 100) {
      dark++;
      if (x < w * 0.45) leftDark++;
      if (x > w * 0.55) rightDark++;
    }
  }
  if (dark > 6) {
    const origY = Math.round((y / h) * 1063);
    console.log(`y~${origY} dark=${dark} left=${leftDark} right=${rightDark}`);
  }
}

// HOME(2) hero - text and suitcase positions
const h2 = "c:/Users/Asus/Pictures/HOME (2).png";
const { data: d2, info: i2 } = await sharp(h2).extract({ left: 0, top: 110, width: 1890, height: 200 }).resize(189, 20).raw().toBuffer({ resolveWithObject: true });
console.log("\n=== HOME(2) hero layout ===");
for (let y = 0; y < i2.height; y++) {
  let left = 0, right = 0;
  for (let x = 0; x < i2.width; x++) {
    const i = (y * i2.width + x) * 3;
    const lum = (d2[i] + d2[i + 1] + d2[i + 2]) / 3;
    if (lum < 100) {
      if (x < i2.width * 0.4) left++;
      if (x > i2.width * 0.5) right++;
    }
  }
  if (left > 3 || right > 3) console.log(`hero y${y} left=${left} right=${right}`);
}