import sharp from "sharp";

const home1 = "c:/Users/Asus/Pictures/HOME (1).png";
const home2 = "c:/Users/Asus/Pictures/HOME (2).png";

async function measure(path, label, region) {
  const meta = await sharp(path).metadata();
  const { data, info } = await sharp(path)
    .extract(region)
    .resize(Math.round(region.width / 10), Math.round(region.height / 10))
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const ch = info.channels;

  // find content bounds (non-background pixels)
  let minX = w, maxX = 0, minY = h, maxY = 0;
  const bg = await sharp(path).extract({
    left: region.left + 20,
    top: region.top + 20,
    width: 30,
    height: 30,
  }).stats();
  const bgLum = bg.channels.slice(0, 3).reduce((a, c) => a + c.mean, 0) / 3;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * ch;
      const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (Math.abs(lum - bgLum) > 15) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  const scaleX = region.width / w;
  const scaleY = region.height / h;
  console.log(`${label}: bg~${Math.round(bgLum)} content bounds x=${Math.round(minX * scaleX)}-${Math.round(maxX * scaleX)} y=${Math.round(minY * scaleY)}-${Math.round(maxY * scaleY)} (region ${region.width}x${region.height})`);
}

// HOME2 hero
await measure(home2, "H2-hero", { left: 0, top: 110, width: 1890, height: 200 });

// HOME1 scroll content sections
await measure(home1, "H1-new-arrival", { left: 0, top: 310, width: 1890, height: 380 });
await measure(home1, "H1-feature-strip", { left: 60, top: 700, width: 1770, height: 100 });
await measure(home1, "H1-audience", { left: 60, top: 810, width: 1770, height: 253 });

// Feature strip individual pill positions
const strip = await sharp(home1).extract({ left: 60, top: 710, width: 1770, height: 80 }).resize(354, 16).greyscale().raw().toBuffer({ resolveWithObject: true });
console.log("\nFeature strip layout:");
for (let y = 0; y < strip.info.height; y++) {
  let row = "";
  for (let x = 0; x < strip.info.width; x++) {
    const v = strip.data[y * strip.info.width + x];
    row += v < 200 ? "#" : " ";
  }
  if (row.includes("#")) console.log(row);
}

// Audience card x positions
const aud = await sharp(home1).extract({ left: 60, top: 880, width: 1770, height: 180 }).resize(354, 36).greyscale().raw().toBuffer({ resolveWithObject: true });
console.log("\nAudience cards:");
for (let y = 0; y < aud.info.height; y++) {
  let row = "";
  for (let x = 0; x < aud.info.width; x++) {
    const v = aud.data[y * aud.info.width + x];
    row += v < 200 ? "#" : " ";
  }
  if (row.includes("#")) console.log(String(y).padStart(2), row);
}

// Save HOME2 hero crop and HOME1 scroll section as implementation refs
await sharp(home2).extract({ left: 0, top: 0, width: 1890, height: 310 }).png().toFile("public/assets/ref-home2-top.png");
await sharp(home1).extract({ left: 0, top: 310, width: 1890, height: 753 }).png().toFile("public/assets/ref-home1-scroll.png");
console.log("\nSaved ref-home2-top.png and ref-home1-scroll.png");