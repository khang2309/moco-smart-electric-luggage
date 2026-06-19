import sharp from "sharp";

const p = "c:/Users/Asus/Pictures/HOME (1).png";

const { data, info } = await sharp(p)
  .extract({ left: 60, top: 800, width: 1770, height: 250 })
  .resize(180, 40)
  .greyscale()
  .raw()
  .toBuffer({ resolveWithObject: true });

for (let y = 0; y < info.height; y++) {
  let row = String(y).padStart(2) + " ";
  for (let x = 0; x < info.width; x++) {
    const v = data[y * info.width + x];
    row += v < 40 ? "#" : v < 95 ? "=" : v < 175 ? "." : " ";
  }
  console.log(row);
}

console.log("\n--- cards ---");
const xs = [120, 520, 920, 1320];
for (let i = 0; i < 4; i++) {
  const { data: d, info: inf } = await sharp(p)
    .extract({ left: xs[i], top: 900, width: 300, height: 140 })
    .resize(60, 35)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  console.log(`\ncard ${i} x=${xs[i]}`);
  for (let y = 0; y < inf.height; y++) {
    let row = "";
    for (let x = 0; x < inf.width; x++) {
      const v = d[y * inf.width + x];
      row += v < 50 ? "#" : v < 140 ? "." : " ";
    }
    console.log(row);
  }
}