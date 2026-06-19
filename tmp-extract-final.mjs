import sharp from "sharp";

const home1 = "c:/Users/Asus/Pictures/HOME (1).png";
const home2 = "c:/Users/Asus/Pictures/HOME (2).png";

const m1 = await sharp(home1).metadata();
const m2 = await sharp(home2).metadata();
console.log("sizes", m1.width, m2.width);

await sharp(home2)
  .extract({ left: 700, top: 100, width: 1180, height: 220 })
  .png()
  .toFile("public/assets/h2-hero-suitcase.png");

await sharp(home1)
  .extract({ left: 750, top: 290, width: 1130, height: 400 })
  .png()
  .toFile("public/assets/h1-newarrival-suitcase.png");

const icons = [
  ["airport", 100, 880, 360, 180],
  ["travel", 480, 880, 360, 180],
  ["business", 860, 880, 360, 180],
  ["student", 1240, 880, 360, 180],
];
for (const [name, left, top, width, height] of icons) {
  await sharp(home1)
    .extract({ left, top, width, height })
    .png()
    .toFile(`public/assets/h1-audience-${name}.png`);
  console.log("icon", name);
}

const title = await sharp(home1)
  .extract({ left: 500, top: 815, width: 900, height: 50 })
  .resize(180, 10)
  .greyscale()
  .raw()
  .toBuffer({ resolveWithObject: true });
console.log("\nH1 audience title:");
for (let y = 0; y < title.info.height; y++) {
  let row = "";
  for (let x = 0; x < title.info.width; x++) {
    const v = title.data[y * title.info.width + x];
    row += v < 120 ? "#" : v < 200 ? "." : " ";
  }
  console.log(row);
}
console.log("done");