import sharp from "sharp";

const home2 = "c:/Users/Asus/Pictures/HOME (2).png";
const home1 = "c:/Users/Asus/Pictures/HOME (1).png";

await sharp(home2).extract({ left: 0, top: 110, width: 1890, height: 200 }).png().toFile("public/assets/hero-home2.png");
await sharp(home2).extract({ left: 900, top: 110, width: 990, height: 200 }).png().toFile("public/assets/hero-home2-suitcase.png");
await sharp(home1).extract({ left: 900, top: 310, width: 990, height: 380 }).png().toFile("public/assets/newarrival-home1-suitcase.png");
console.log("saved");