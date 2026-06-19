import sharp from "sharp";

const home1 = "c:/Users/Asus/Pictures/HOME (1).png";
const home2 = "c:/Users/Asus/Pictures/HOME (2).png";

const w = 189;
const h = 106;

const buf1 = await sharp(home1).resize(w, h).raw().toBuffer();
const buf2 = await sharp(home2).resize(w, h).raw().toBuffer();

console.log("=== Row diff (HOME2 vs HOME1) ===");
for (let y = 0; y < h; y++) {
  let diff = 0;
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 3;
    const lum1 = (buf1[i] + buf1[i + 1] + buf1[i + 2]) / 3;
    const lum2 = (buf2[i] + buf2[i + 1] + buf2[i + 2]) / 3;
    if (Math.abs(lum1 - lum2) > 25) diff++;
  }
  if (diff > 8) {
    const origY = Math.round((y / h) * 1063);
    console.log(`y~${origY} diffPixels=${diff}`);
  }
}

// Extract key sections side by side for comparison
const sections = [
  ["hero", 110, 200],
  ["new-arrival", 310, 380],
  ["feature-strip", 700, 100],
  ["audience", 810, 253],
];

for (const [name, top, height] of sections) {
  await sharp(home1)
    .extract({ left: 0, top, width: 1890, height })
    .resize(400)
    .png()
    .toFile(`public/assets/compare-home1-${name}.png`);
  await sharp(home2)
    .extract({ left: 0, top, width: 1890, height })
    .resize(400)
    .png()
    .toFile(`public/assets/compare-home2-${name}.png`);
  console.log(`saved compare-${name}`);
}

// Sample colors from each section in both mockups
for (const [name, top, height] of sections) {
  for (const [label, path] of [["H1", home1], ["H2", home2]]) {
    const s = await sharp(path).extract({ left: 80, top: top + 40, width: 200, height: 60 }).stats();
    const rgb = s.channels.slice(0, 3).map((c) => Math.round(c.mean));
    console.log(`${label} ${name} left-text rgb: ${rgb.join(",")}`);
  }
}