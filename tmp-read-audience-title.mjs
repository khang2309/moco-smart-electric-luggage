import sharp from "sharp";

const path = "public/assets/text-audience-title.png";
const { data, info } = await sharp(path).resize(120, 12).greyscale().raw().toBuffer({ resolveWithObject: true });
for (let y = 0; y < info.height; y++) {
  let row = "";
  for (let x = 0; x < info.width; x++) {
    const v = data[y * info.width + x];
    row += v < 100 ? "#" : v < 200 ? "." : " ";
  }
  console.log(row);
}