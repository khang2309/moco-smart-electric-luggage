import sharp from "sharp";
import fs from "fs";

const mockup = "c:/Users/Asus/Pictures/HOME (1).png";
const home = "c:/Users/Asus/Pictures/HOME.png";

// Find vertical bands with significant dark pixels (content)
const { data, info } = await sharp(mockup).resize(189, 106).raw().toBuffer({ resolveWithObject: true });
const w = info.width;
const h = info.height;
console.log("=== Content bands ===");
for (let y = 0; y < h; y++) {
  let dark = 0;
  let mid = 0;
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 3;
    const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
    if (lum < 80) dark++;
    if (lum < 180) mid++;
  }
  if (dark > 8) console.log(`y=${y} (${Math.round(y / h * 1063)}) dark=${dark} mid=${mid}`);
}

// Compare crop from mockup right side vs home.png
async function saveCrop(label, path, region) {
  await sharp(path).extract(region).png().toFile(`c:/Users/Asus/Desktop/daihoc/EXE1/tmp-${label}.png`);
  console.log("saved", label);
}

await saveCrop("mockup-suitcase", mockup, { left: 900, top: 300, width: 900, height: 500 });
await saveCrop("mockup-left-text", mockup, { left: 80, top: 300, width: 700, height: 500 });
await saveCrop("home-full", home, { left: 0, top: 0, width: 1890, height: 1063 });

// Sample dominant colors from mockup left text area
const textArea = await sharp(mockup).extract({ left: 100, top: 320, width: 600, height: 400 }).stats();
console.log("text area stats", JSON.stringify(textArea.channels.map((c) => Math.round(c.mean))));