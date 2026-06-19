import sharp from "sharp";
import fs from "fs";

// Use tesseract alternative: sample high-contrast text rows and output for manual reading
const home1 = "c:/Users/Asus/Pictures/HOME (1).png";

const textRegions = [
  ["audience-title", { left: 400, top: 820, width: 1100, height: 60 }],
  ["audience-card1-title", { left: 120, top: 960, width: 350, height: 40 }],
  ["audience-card1-desc", { left: 80, top: 990, width: 400, height: 60 }],
];

for (const [name, region] of textRegions) {
  await sharp(home1)
    .extract(region)
    .resize(220)
    .png()
    .toFile(`public/assets/text-${name}.png`);
  console.log("saved", name);
}