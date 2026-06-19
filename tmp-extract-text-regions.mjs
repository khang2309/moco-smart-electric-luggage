import sharp from "sharp";

const home1 = "c:/Users/Asus/Pictures/HOME (1).png";

const regions = [
  ["hero-text", { left: 80, top: 140, width: 700, height: 160 }],
  ["new-arrival-text", { left: 80, top: 340, width: 700, height: 350 }],
  ["feature-strip", { left: 60, top: 700, width: 1770, height: 100 }],
  ["audience-title", { left: 60, top: 820, width: 1770, height: 80 }],
  ["audience-cards", { left: 60, top: 900, width: 1770, height: 160 }],
];

for (const [name, region] of regions) {
  await sharp(home1).extract(region).png().toFile(`public/assets/ref-${name}.png`);
  const stats = await sharp(home1).extract(region).stats();
  console.log(name, "avg", stats.channels.slice(0, 3).map((c) => Math.round(c.mean)).join(","));
}
console.log("done");