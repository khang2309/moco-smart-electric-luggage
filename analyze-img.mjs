import sharp from "sharp";

async function ascii(path, region, label) {
  let img = sharp(path);
  if (region) img = img.extract(region);
  const { data, info } = await img.resize(120).greyscale().raw().toBuffer({ resolveWithObject: true });
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
const home = "c:/Users/Asus/Pictures/HOME.png";

await ascii(mockup, null, "mockup full");
await ascii(mockup, { left: 0, top: 200, width: 1890, height: 500 }, "mockup mid section");
await ascii(mockup, { left: 0, top: 500, width: 1890, height: 400 }, "mockup lower section");
await ascii(home, null, "home.png full");