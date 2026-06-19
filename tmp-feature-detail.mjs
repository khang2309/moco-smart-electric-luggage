import sharp from "sharp";

const home1 = "c:/Users/Asus/Pictures/HOME (1).png";
const { data, info } = await sharp(home1)
  .extract({ left: 60, top: 700, width: 1770, height: 110 })
  .resize(354, 22)
  .raw()
  .toBuffer({ resolveWithObject: true });

for (let y = 0; y < info.height; y++) {
  let row = String(y).padStart(2) + " ";
  for (let x = 0; x < info.width; x++) {
    const i = (y * info.width + x) * 3;
    const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
    row += lum < 180 ? (lum < 100 ? "#" : ".") : " ";
  }
  if (row.includes("#") || row.includes(".")) console.log(row);
}