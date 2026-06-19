import sharp from "sharp";
import { copyFileSync } from "fs";

const home1 = "c:/Users/Asus/Pictures/HOME (1).png";
const home2 = "c:/Users/Asus/Pictures/HOME (2).png";

// Bỏ header mockup (110px), giữ nguyên phần còn lại — text đã nằm trong ảnh
await sharp(home2)
  .extract({ left: 0, top: 110, width: 1890, height: 953 })
  .png()
  .toFile("public/assets/mockup-home-2.png");

await sharp(home1)
  .extract({ left: 0, top: 110, width: 1890, height: 953 })
  .png()
  .toFile("public/assets/mockup-home-1.png");

console.log("mockup images ready");