import sharp from "sharp";

const home1 = "c:/Users/Asus/Pictures/HOME (1).png";
const home2 = "c:/Users/Asus/Pictures/HOME (2).png";

async function slice(path, label, region, w = 180) {
  const { data, info } = await sharp(path)
    .extract(region)
    .resize(w)
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

const m1 = await sharp(home1).metadata();
const m2 = await sharp(home2).metadata();
console.log("HOME1:", m1.width, "x", m1.height);
console.log("HOME2:", m2.width, "x", m2.height);

// HOME2 = top screen (hero area, below header)
await slice(home2, "H2 viewport top (0-310)", { left: 0, top: 0, width: 1890, height: 310 });

// HOME1 = scrolled view (what's visible when scrolled down)
await slice(home1, "H1 viewport scrolled (280-1063)", { left: 0, top: 280, width: 1890, height: 783 });

// Also check: is HOME1 showing same scroll position as "below hero"?
await slice(home1, "H1 new-arrival+features+audience", { left: 0, top: 310, width: 1890, height: 753 });

// Color samples
for (const [name, path, region] of [
  ["H2 hero bg", home2, { left: 60, top: 150, width: 80, height: 80 }],
  ["H2 hero text area", home2, { left: 100, top: 160, width: 400, height: 120 }],
  ["H1 scroll bg", home1, { left: 60, top: 350, width: 80, height: 80 }],
  ["H1 pill", home1, { left: 120, top: 720, width: 300, height: 60 }],
  ["H1 audience card", home1, { left: 120, top: 900, width: 350, height: 140 }],
]) {
  const s = await sharp(path).extract(region).stats();
  console.log(name, "rgb", s.channels.slice(0, 3).map((c) => Math.round(c.mean)).join(","));
}

// Save implementation reference slices
await sharp(home2).extract({ left: 0, top: 110, width: 1890, height: 200 }).png().toFile("public/assets/ref-h2-hero.png");
await sharp(home1).extract({ left: 0, top: 310, width: 1890, height: 753 }).png().toFile("public/assets/ref-h1-scroll.png");
console.log("\nrefs saved");