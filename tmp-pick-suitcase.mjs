import sharp from "sharp";

const ref = await sharp("c:/Users/Asus/Pictures/HOME (2).png")
  .extract({ left: 900, top: 110, width: 900, height: 200 })
  .resize(60, 20)
  .raw()
  .toBuffer();

for (const file of ["banner.png", "home.png", "introVali.png"]) {
  const path = `public/assets/${file}`;
  const meta = await sharp(path).metadata();
  const buf = await sharp(path)
    .resize(60, 20)
    .raw()
    .toBuffer();
  let diff = 0;
  for (let i = 0; i < Math.min(ref.length, buf.length); i += 3) {
    const a = (ref[i] + ref[i + 1] + ref[i + 2]) / 3;
    const b = (buf[i] + buf[i + 1] + buf[i + 2]) / 3;
    if (Math.abs(a - b) > 25) diff++;
  }
  console.log(file, meta.width, "x", meta.height, "diff", diff);
}