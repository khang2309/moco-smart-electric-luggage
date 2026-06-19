import sharp from "sharp";

const p = "c:/Users/Asus/Pictures/HOME (1).png";
const region = { left: 80, top: 820, width: 1730, height: 220 };
const { data, info } = await sharp(p).extract(region).resize(346, 44).raw().toBuffer({ resolveWithObject: true });
const w = info.width;
const h = info.height;

for (let y = 0; y < h; y++) {
  let darkCols = [];
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 3;
    const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
    if (lum < 200) darkCols.push(x);
  }
  if (darkCols.length > 8) {
    const groups = [];
    let start = darkCols[0];
    let end = darkCols[0];
    for (let i = 1; i < darkCols.length; i++) {
      if (darkCols[i] - end <= 2) end = darkCols[i];
      else {
        if (end - start > 4) groups.push([start, end]);
        start = darkCols[i];
        end = darkCols[i];
      }
    }
    if (end - start > 4) groups.push([start, end]);
    if (groups.length) {
      const origY = 820 + Math.round((y / h) * 220);
      console.log(`y=${origY}`, groups.map((g) => `${Math.round((g[0] / w) * 1730 + 80)}-${Math.round((g[1] / w) * 1730 + 80)}`).join(" | "));
    }
  }
}