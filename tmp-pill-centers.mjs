import sharp from "sharp";
const home1 = "c:/Users/Asus/Pictures/HOME (1).png";
const centers = [280, 680, 1080, 1480];
for (const x of centers) {
  const s = await sharp(home1).extract({ left: x - 30, top: 715, width: 60, height: 50 }).stats();
  const edge = await sharp(home1).extract({ left: x - 100, top: 710, width: 200, height: 60 }).resize(40, 12).greyscale().raw().toBuffer({ resolveWithObject: true });
  console.log(`center x=${x} avg rgb`, s.channels.slice(0, 3).map((c) => Math.round(c.mean)).join(","));
  for (let y = 0; y < edge.info.height; y++) {
    let row = "";
    for (let xi = 0; xi < edge.info.width; xi++) {
      const v = edge.data[y * edge.info.width + xi];
      row += v < 220 ? (v < 180 ? "#" : ".") : " ";
    }
    if (row.includes("#")) console.log(" ", row);
  }
}