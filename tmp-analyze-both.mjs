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

const home1 = "c:/Users/Asus/Pictures/HOME (1).png";
const home2 = "c:/Users/Asus/Pictures/HOME (2).png";

const m1 = await sharp(home1).metadata();
const m2 = await sharp(home2).metadata();
console.log("HOME(1):", m1.width, "x", m1.height);
console.log("HOME(2):", m2.width, "x", m2.height);

await ascii(home2, null, "HOME(2) full");
await ascii(home1, null, "HOME(1) full");
await ascii(home2, { left: 0, top: 0, width: m2.width, height: Math.round(m2.height * 0.55) }, "HOME(2) top");
await ascii(home2, { left: 0, top: Math.round(m2.height * 0.45), width: m2.width, height: Math.round(m2.height * 0.55) }, "HOME(2) bottom");
await ascii(home1, { left: 0, top: 0, width: m1.width, height: Math.round(m1.height * 0.35) }, "HOME(1) top");
await ascii(home1, { left: 0, top: Math.round(m1.height * 0.3), width: m1.width, height: Math.round(m1.height * 0.4) }, "HOME(1) mid");
await ascii(home1, { left: 0, top: Math.round(m1.height * 0.65), width: m1.width, height: Math.round(m1.height * 0.35) }, "HOME(1) bottom");