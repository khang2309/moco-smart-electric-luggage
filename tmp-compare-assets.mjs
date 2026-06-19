import sharp from "sharp";

const home2 = "c:/Users/Asus/Pictures/HOME (2).png";
const home1 = "c:/Users/Asus/Pictures/HOME (1).png";

const assets = [
  "public/assets/banner.png",
  "public/assets/home.png",
  "public/assets/introVali.png",
  "public/assets/home-reference.png",
];

async function diffScore(refPath, refRegion, candPath) {
  const ref = await sharp(refPath).extract(refRegion).resize(60, 30).raw().toBuffer();
  const cand = await sharp(candPath).resize(60, 30).raw().toBuffer();
  let diff = 0;
  for (let i = 0; i < Math.min(ref.length, cand.length); i += 3) {
    const a = (ref[i] + ref[i + 1] + ref[i + 2]) / 3;
    const b = (cand[i] + cand[i + 1] + cand[i + 2]) / 3;
    if (Math.abs(a - b) > 20) diff++;
  }
  return diff;
}

console.log("=== Full image diff vs mockups ===");
for (const a of assets) {
  const d2 = await diffScore(home2, { left: 0, top: 0, width: 1890, height: 1063 }, a);
  const d1 = await diffScore(home1, { left: 0, top: 0, width: 1890, height: 1063 }, a);
  console.log(a.split("/").pop(), "vs H2:", d2, "vs H1:", d1);
}

console.log("\n=== Hero region (H2) ===");
for (const a of assets) {
  const d = await diffScore(home2, { left: 0, top: 110, width: 1890, height: 200 }, a);
  console.log(a.split("/").pop(), "diff", d);
}

console.log("\n=== New arrival region (H1) ===");
for (const a of assets) {
  const d = await diffScore(home1, { left: 0, top: 310, width: 1890, height: 380 }, a);
  console.log(a.split("/").pop(), "diff", d);
}