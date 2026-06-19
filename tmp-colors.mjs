import sharp from "sharp";
const home1 = "c:/Users/Asus/Pictures/HOME (1).png";
for (const [name, region] of [
  ["pill", { left: 150, top: 730, width: 250, height: 50 }],
  ["pill-bg-center", { left: 200, top: 745, width: 150, height: 30 }],
  ["audience-card", { left: 150, top: 900, width: 300, height: 120 }],
  ["audience-bg", { left: 200, top: 950, width: 200, height: 60 }],
]) {
  const s = await sharp(home1).extract(region).stats();
  console.log(name, s.channels.slice(0, 3).map((c) => Math.round(c.mean)).join(","));
}