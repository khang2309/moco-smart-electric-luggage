import sharp from "sharp";

const mockup = "c:/Users/Asus/Pictures/HOME (2).png";
const meta = await sharp(mockup).metadata();
console.log("size", meta.width, meta.height);

async function slice(label, region, w = 160) {
  const { data, info } = await sharp(mockup)
    .extract(region)
    .resize(w)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const h = info.height;
  const ch = info.channels;
  console.log(`\n=== ${label} ${region.width}x${region.height} -> ${info.width}x${h} ===`);
  for (let y = 0; y < h; y++) {
    let row = "";
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * ch;
      const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
      row += lum < 35 ? "#" : lum < 90 ? "=" : lum < 170 ? "." : " ";
    }
    console.log(row);
  }
}

await slice("header", { left: 0, top: 0, width: 1890, height: 110 });
await slice("hero", { left: 0, top: 110, width: 1890, height: 200 });
await slice("new-arrival", { left: 0, top: 310, width: 1890, height: 380 });
await slice("between", { left: 0, top: 690, width: 1890, height: 120 });
await slice("audience", { left: 0, top: 810, width: 1890, height: 253 });

for (const [name, region] of [
  ["hero-bg", { left: 50, top: 150, width: 40, height: 40 }],
  ["hero-text", { left: 100, top: 180, width: 40, height: 40 }],
  ["new-arrival-bg", { left: 100, top: 400, width: 40, height: 40 }],
]) {
  const s = await sharp(mockup).extract(region).stats();
  const rgb = s.channels.slice(0, 3).map((c) => Math.round(c.mean));
  console.log(name, "rgb", rgb.join(","));
}