import sharp from "sharp";

const home2Hero = { left: 0, top: 110, width: 1890, height: 200 };
const candidates = [
  "c:/Users/Asus/Pictures/HOME (2).png",
  "c:/Users/Asus/Desktop/daihoc/EXE1/public/assets/banner.png",
  "c:/Users/Asus/Desktop/daihoc/EXE1/public/assets/home.png",
  "c:/Users/Asus/Desktop/daihoc/EXE1/public/assets/home-reference.png",
];

const ref = await sharp("c:/Users/Asus/Pictures/HOME (2).png")
  .extract(home2Hero)
  .resize(80, 20)
  .raw()
  .toBuffer();

for (const path of candidates) {
  let img = sharp(path);
  const meta = await img.metadata();
  if (meta.width >= 1890) {
    img = img.extract(home2Hero);
  }
  const buf = await img.resize(80, 20).raw().toBuffer();
  let diff = 0;
  for (let i = 0; i < ref.length; i += 3) {
    const a = (ref[i] + ref[i + 1] + ref[i + 2]) / 3;
    const b = (buf[i] + buf[i + 1] + buf[i + 2]) / 3;
    if (Math.abs(a - b) > 20) diff++;
  }
  console.log(path.split("/").pop(), "diffScore", diff);
}