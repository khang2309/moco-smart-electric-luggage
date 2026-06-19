import sharp from "sharp";

const p = "c:/Users/Asus/Pictures/HOME (1).png";
const icons = [
  ["airport", 210, 950, 190, 100],
  ["travel", 530, 950, 190, 100],
  ["business", 830, 950, 190, 100],
  ["student", 1140, 950, 190, 100],
];

for (const [name, left, top, width, height] of icons) {
  await sharp(p)
    .extract({ left, top, width, height })
    .png()
    .toFile(`public/assets/audience-${name}.png`);
  console.log("saved", name);
}