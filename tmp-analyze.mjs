import sharp from "sharp";

async function ascii(path, region, label) {
  let img = sharp(path);
  if (region) img = img.extract(region);
  const { data, info } = await img.resize(100).greyscale().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  console.log(`\n=== ${label} (${w}x${h}) ===`);
  for (let y = 0; y < h; y++) {
    let s = "";
    for (let x = 0; x < w; x++) {
      const v = data[y * w + x];
      s += v < 35 ? "#" : v < 90 ? "=" : v < 160 ? "." : " ";
    }
    console.log(s);
  }
}

const mockup = "c:/Users/Asus/Pictures/HOME (1).png";
const shot = "c:/Users/Asus/Pictures/Screenshots/Screenshot 2026-06-19 191625.png";

const shotMeta = await sharp(shot).metadata();
console.log("screenshot size:", shotMeta.width, "x", shotMeta.height);
await ascii(shot, null, "user screenshot full");

await ascii(mockup, { left: 0, top: 280, width: 1890, height: 380 }, "mockup new-arrival");
await ascii(mockup, { left: 0, top: 660, width: 1890, height: 280 }, "mockup below new-arrival");
await ascii("c:/Users/Asus/Pictures/HOME.png", null, "home.png");