import sharp from "sharp";

const home1 = "c:/Users/Asus/Pictures/HOME (1).png";
const home2 = "c:/Users/Asus/Pictures/HOME (2).png";

async function slice(path, label, region) {
  const { data, info } = await sharp(path)
    .extract(region)
    .resize(160)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const h = info.height;
  const ch = info.channels;
  console.log(`\n=== ${label} ===`);
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

await slice(home2, "HOME2 hero only", { left: 0, top: 110, width: 1890, height: 200 });
await slice(home1, "HOME1 hero only", { left: 0, top: 110, width: 1890, height: 200 });
await slice(home1, "HOME1 from new-arrival down", { left: 0, top: 310, width: 1890, height: 753 });
await slice(home2, "HOME2 from new-arrival down", { left: 0, top: 310, width: 1890, height: 753 });

// Save hero crops for reference
await sharp(home2).extract({ left: 0, top: 110, width: 1890, height: 200 }).png().toFile("public/assets/mockup-hero-home2-ref.png");
await sharp(home1).extract({ left: 0, top: 310, width: 1890, height: 753 }).png().toFile("public/assets/mockup-scroll-home1-ref.png");
console.log("saved reference crops");